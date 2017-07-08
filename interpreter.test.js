const start = Date.now()
const {
    TT,
    NT,
    Lexer,
    parse,
    printNode
} = require("./interpreter")

let l

let id
l = new Lexer("a")
id = l.next()
console.assert(id.type == TT.ID)
console.assert(id.value == "a")
console.assert(l.next().type == TT.EOF)

l = new Lexer("aa")
id = l.next()
console.assert(id.type == TT.ID)
console.assert(id.value == "aa")
console.assert(l.next().type == TT.EOF)

l = new Lexer("_a")
id = l.next()
console.assert(id.type == TT.ID)
console.assert(id.value == "_a")
console.assert(l.next().type == TT.EOF)

l = new Lexer("$a")
id = l.next()
console.assert(id.type == TT.ID)
console.assert(id.value == "$a")
console.assert(l.next().type == TT.EOF)

let b
l = new Lexer("true")
b = l.next()
console.assert(b.type == TT.BOOLEAN)
console.assert(b.value == true)
console.assert(l.next().type == TT.EOF)

l = new Lexer("false")
b = l.next()
console.assert(b.type == TT.BOOLEAN)
console.assert(b.value == false)
console.assert(l.next().type == TT.EOF)

let int
l = new Lexer("1")
int = l.next()
console.assert(int.type == TT.INTEGER)
console.assert(int.value == 1)
console.assert(l.next().type == TT.EOF)

l = new Lexer("11")
int = l.next()
console.assert(int.type == TT.INTEGER)
console.assert(int.value == 11)
console.assert(l.next().type == TT.EOF)

l = new Lexer(".1")
int = l.next()
console.assert(int.type == TT.INTEGER)
console.assert(int.value == .1)
console.assert(l.next().type == TT.EOF)

l = new Lexer("1.")
int = l.next()
console.assert(int.type == TT.INTEGER)
console.assert(int.value == 1.)
console.assert(l.next().type == TT.EOF)

l = new Lexer(".")
try {
    l.next()
    console.assert(false)
} catch (error) {
    if (error.constructor.name == "AssertionError") {
        throw error
    }
}

let str
l = new Lexer('"test" 1')
str = l.next()
console.assert(str.type == TT.STRING)
console.assert(str.value == "test")
int = l.next()
console.assert(int.type == TT.INTEGER)
console.assert(int.value == 1)
console.assert(l.next().type == TT.EOF)

l = new Lexer(`1+1*3 == "test" && true != !0 || -1*(1+1) > a && f(a,1 == 1) == 1`)
const expected = {
    type: NT.LOGIC_COMPARISON,
    left: {
        type: NT.LOGIC_COMPARISON,
        left: {
            type: NT.LOGIC_COMPARISON,
            left: {
                type: NT.COMPARISON,
                left: {
                    type: NT.EXPRESSION,
                    left: {
                        type: NT.CONSTANT,
                        value: 1
                    },
                    operator: {
                        type: TT.PLUS
                    },
                    right: {
                        type: NT.TERM,
                        left: {
                            type: NT.CONSTANT,
                            value: 1
                        },
                        operator: {
                            type: TT.MULTIPLY
                        },
                        right: {
                            type: NT.CONSTANT,
                            value: 3
                        }
                    }
                },
                operator: {
                    type: TT.EQUALS
                },
                right: {
                    type: NT.CONSTANT,
                    value: "test"
                }
            },
            operator: {
                type: TT.AND
            },
            right: {
                type: NT.COMPARISON,
                left: {
                    type: NT.CONSTANT,
                    value: true
                },
                operator: {
                    type: TT.NOT_EQUAL
                },
                right: {
                    type: NT.NOT,
                    expression: {
                        type: NT.CONSTANT,
                        value: 0
                    }
                }
            }
        },
        operator: {
            type: TT.OR
        },
        right: {
            type: NT.COMPARISON,
            left: {
                type: NT.TERM,
                left: {
                    type: NT.UNARY_MINUS,
                    expression: {
                        type: NT.CONSTANT,
                        value: 1
                    }
                },
                operator: {
                    type: TT.MULTIPLY
                },
                right: {
                    type: NT.EXPRESSION,
                    left: {
                        type: NT.CONSTANT,
                        value: 1
                    },
                    operator: {
                        type: TT.PLUS
                    },
                    right: {
                        type: NT.CONSTANT,
                        value: 1
                    }
                }
            },
            operator: {
                type: TT.BIGGER_THAN
            },
            right: {
                type: NT.VARIABLE,
                label: "a"
            }
        }
    },
    operator: {
        type: TT.AND
    },
    right: {
        type: NT.COMPARISON,
        left: {
            type: NT.FUNCTION,
            args: [{
                    type: NT.VARIABLE,
                    label: "a"
                },
                {
                    type: NT.COMPARISON,
                    left: {
                        type: NT.CONSTANT,
                        value: 1
                    },
                    operator: {
                        type: TT.EQUALS
                    },
                    right: {
                        type: NT.CONSTANT,
                        value: 1
                    }
                }
            ],
            label: "f"
        },
        operator: {
            type: TT.EQUALS
        },
        right: {
            type: NT.CONSTANT,
            value: 1
        }
    }
}

console.assert(printNode(expected) == printNode(parse(l)))
console.log(Date.now() - start)