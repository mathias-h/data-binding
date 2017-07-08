const TT = {
    EOF: "EOF",
    AND: "AND",
    OR: "OR",
    EQUALS: "EQUALS",
    NOT_EQUAL: "NOT_EQUAL",
    BIGGER_EQUAL: "BIGGER_EQUAL",
    LESS_EQUAL: "LESS_EQUAL",
    LESS_THAN: "LESS_THAN",
    BIGGER_THAN: "BIGGER_THAN",
    NOT: "NOT",
    PLUS: "PLUS",
    MINUS: "MINUS",
    MULTIPLY: "MULTIPLY",
    DIVIDE: "DIVIDE",
    OPEN_PAREN: "OPEN_PAREN",
    CLOSE_PAREN: "CLOSE_PAREN",
    COMMA: "COMMA",
    INTEGER: "INTEGER",
    BOOLEAN: "BOOLEAN",
    STRING: "STRING",
    ID: "ID",
}

const reservedKeywords = {
    "true": {
        type: TT.BOOLEAN,
        value: true
    },
    "false": {
        type: TT.BOOLEAN,
        value: false
    }
}

class Lexer {
    constructor(text) {
        this.pos = 0
        this.text = text
        this.currentChar = this.text[this.pos]
    }

    advance() {
        this.pos += 1
        this.currentChar = this.text[this.pos]
    }

    isDigit(c) {
        return c == 46 || (c >= 48 && c <= 57)
    }

    isCharacter(c) {
        return c == 36 || c == 95 || (c >= 65 && c <= 90) || (c >= 97 && c <= 122)
    }

    isWhitespace(c) {
        return c == " " || c == "\t" || c == "\n"
    }

    integer() {
        const start = this.pos

        this.advance()

        while (this.currentChar && this.isDigit(this.currentChar.charCodeAt(0))) {
            this.advance()
        }

        const intString = this.text.substring(start, this.pos)

        if (intString == ".") this.error()

        return {
            type: TT.INTEGER,
            value: Number(intString)
        }
    }

    string() {
        const start = this.pos + 1

        this.advance()

        while (this.currentChar && this.currentChar != '"') {
            this.advance()
        }

        this.advance()

        return {
            type: TT.STRING,
            value: this.text.substring(start, this.pos - 1)
        }
    }

    id() {
        const start = this.pos

        this.advance()

        while (this.currentChar && (this.currentChar == "." || this.isCharacter(this.currentChar.charCodeAt(0)))) {
            this.advance()
        }

        const id = this.text.substring(start, this.pos)
        const reservedKeyword = reservedKeywords[id]

        if (reservedKeyword) {
            return reservedKeyword
        } else {
            return {
                type: TT.ID,
                value: id
            }
        }
    }

    whitespace() {
        this.advance()

        while (this.currentChar && this.isWhitespace(this.currentChar)) {
            this.advance()
        }
    }

    error() {
        throw new Error("unexpected token: " + this.pos)
    }

    next() {
        if (!this.currentChar) {
            return {
                type: TT.EOF
            }
        }

        if (this.isWhitespace(this.currentChar)) {
            this.whitespace()
        }

        if (this.isDigit(this.currentChar.charCodeAt(0))) {
            return this.integer()
        } else if (this.currentChar == '"') {
            return this.string()
        } else if (this.isCharacter(this.currentChar.charCodeAt(0))) {
            return this.id()
        } else if (this.currentChar == ",") {
            this.advance()
            return {
                type: TT.COMMA
            }
        } else if (this.currentChar == "(") {
            this.advance()
            return {
                type: TT.OPEN_PAREN
            }
        } else if (this.currentChar == ")") {
            this.advance()
            return {
                type: TT.CLOSE_PAREN
            }
        } else if (this.currentChar == "+") {
            this.advance()
            return {
                type: TT.PLUS
            }
        } else if (this.currentChar == "-") {
            this.advance()
            return {
                type: TT.MINUS
            }
        } else if (this.currentChar == "*") {
            this.advance()
            return {
                type: TT.MULTIPLY
            }
        } else if (this.currentChar == "/") {
            this.advance()
            return {
                type: TT.DIVIDE
            }
        }
        if (this.currentChar == "!") {
            this.advance()
            if (this.currentChar == "=") {
                this.advance()
                return {
                    type: TT.NOT_EQUAL
                }
            } else {
                return {
                    type: TT.NOT
                }
            }
        } else if (this.currentChar == "=" && this.text[this.pos + 1] == "=") {
            this.advance()
            this.advance()
            return {
                type: TT.EQUALS
            }
        } else if (this.currentChar == "<") {
            this.advance()
            if (this.currentChar == "=") {
                this.advance()
                return {
                    type: TT.LESS_EQUAL
                }
            } else {
                return {
                    type: TT.LESS_THAN
                }
            }
        } else if (this.currentChar == ">") {
            this.advance()
            if (this.currentChar == "=") {
                this.advance()
                return {
                    type: TT.BIGGER_EQUAL
                }
            } else {
                return {
                    type: TT.BIGGER_THAN
                }
            }
        } else if (this.currentChar == "&" && this.text[this.pos + 1] == "&") {
            this.advance()
            this.advance()
            return {
                type: TT.AND
            }
        } else if (this.currentChar == "|" && this.text[this.pos + 1] == "|") {
            this.advance()
            this.advance()
            return {
                type: TT.OR
            }
        } else {
            this.error()
        }
    }
}

const NT = {
    LOGIC_COMPARISON: "LOGIC_COMPARISON",
    COMPARISON: "COMPARISON",
    EXPRESSION: "EXPRESSION",
    TERM: "TERM",
    CONSTANT: "CONSTANT",
    NOT: "NOT",
    UNARY_PLUS: "UNARY_PLUS",
    UNARY_MINUS: "UNARY_MINUS",
    VARIABLE: "VARIABLE",
    FUNCTION: "FUNCTION"
}

function parse(lexer) {
    let currentToken = lexer.next()

    function eat(type) {
        if (currentToken.type == type) {
            currentToken = lexer.next()
        } else {
            lexer.error()
        }
    }

    function binaryOperation(nodeType, getOperand, types) {
        let node = getOperand()

        while (currentToken && types.includes(currentToken.type)) {
            const operator = currentToken
            currentToken = lexer.next()
            node = {
                type: nodeType,
                left: node,
                operator,
                right: getOperand()
            }
        }

        return node
    }

    function factor() {
        if (currentToken.type == TT.ID) {
            const label = currentToken.value
            currentToken = lexer.next()
            if (currentToken.type == TT.OPEN_PAREN) {
                currentToken = lexer.next()
                const args = []
                while (currentToken.type != TT.CLOSE_PAREN) {
                    const arg = logicCompraison()
                    if (currentToken.type != TT.CLOSE_PAREN) {
                        eat(TT.COMMA)
                    }
                    args.push(arg)
                }
                currentToken = lexer.next()
                return {
                    type: NT.FUNCTION,
                    label,
                    args
                }
            } else {
                return {
                    type: NT.VARIABLE,
                    label
                }
            }
        } else if (currentToken.type == TT.INTEGER || currentToken.type == TT.BOOLEAN || currentToken.type == TT.STRING) {
            const node = {
                type: NT.CONSTANT,
                value: currentToken.value
            }
            currentToken = lexer.next()
            return node
        } else if (currentToken.type == TT.OPEN_PAREN) {
            currentToken = lexer.next()
            const expr = logicCompraison()
            eat(TT.CLOSE_PAREN)
            return expr
        } else if (currentToken.type == TT.NOT) {
            currentToken = lexer.next()
            return {
                type: NT.NOT,
                expression: factor()
            }
        } else if (currentToken.type == TT.PLUS) {
            currentToken = lexer.next()
            return {
                type: NT.UNARY_PLUS,
                expression: factor()
            }
        } else if (currentToken.type == TT.MINUS) {
            currentToken = lexer.next()
            return {
                type: NT.UNARY_MINUS,
                expression: factor()
            }
        }
    }

    function term() {
        return binaryOperation(NT.TERM, factor, [TT.MULTIPLY, TT.DIVIDE])
    }

    function expression() {
        return binaryOperation(NT.EXPRESSION, term, [TT.PLUS, TT.MINUS])
    }

    function comparison() {
        return binaryOperation(NT.COMPARISON, expression, [TT.EQUALS, TT.NOT_EQUAL, TT.BIGGER_THAN, TT.BIGGER_EQUAL, TT.LESS_THAN, TT.LESS_EQUAL])
    }

    function logicCompraison() {
        return binaryOperation(NT.LOGIC_COMPARISON, comparison, [TT.AND, TT.OR])
    }

    return logicCompraison()
}


function printNode(node, level = 1) {
    const binaryOperator = (node) => {
        return `${printNode(node.left, level + 1) + " " + node.operator.type + " " + printNode(node.right, level + 1)}`
    }
    const visitors = {
        LOGIC_COMPARISON: binaryOperator,
        COMPARISON: binaryOperator,
        EXPRESSION: binaryOperator,
        TERM: binaryOperator,
        CONSTANT(node) {
            return node.value
        },
        NOT(node) {
            return "!" + printNode(node.expression)
        },
        UNARY_PLUS(node) {
            return "+" + printNode(node.expression)
        },
        UNARY_MINUS(node) {
            return "-" + printNode(node.expression)
        },
        VARIABLE(node) {
            return node.label
        },
        FUNCTION(node) {
            return node.label + "(" + node.args.map(a => printNode(a, level + 1)).join(",") + ")"
        }
    }

    return visitors[node.type](node)
}

// console.log(JSON.stringify(parse(new Lexer("1 == 1+1 && 1 && 1")), null, 4))

module.exports = {
    Lexer,
    TT,
    NT,
    parse,
    printNode
}