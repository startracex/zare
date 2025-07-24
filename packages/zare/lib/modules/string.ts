export default [
    { fnName: "length", fnParams: ['str'], fnBody: `return str.length` },
    { fnName: "upper", fnParams: ['str'], fnBody: `return str.toUpperCase()` },
    { fnName: "lower", fnParams: ['str'], fnBody: `return str.toLowerCase()` },
    { fnName: "at", fnParams: ['str', 'index'], fnBody: `return str.charAt(Number(index))` },
    { fnName: "codeAt", fnParams: ['str', 'index'], fnBody: `return str.charCodeAt(Number(index))` },
    { fnName: "slice", fnParams: ['str', 'start', 'end'], fnBody: `return str.slice(Number(start), Number(end))` },
    { fnName: "subString", fnParams: ['str', 'start', 'end'], fnBody: `return str.substring(Number(start), Number(end))` },
    { fnName: "concat", fnParams: ['str1', 'str2'], fnBody: `return str1.concat(str2)` },
    { fnName: "trim", fnParams: ['str'], fnBody: `return str.trim()` },
    { fnName: "trimStart", fnParams: ['str'], fnBody: `return str.trimStart()` },
    { fnName: "trimEnd", fnParams: ['str'], fnBody: `return str.trimEnd()` },
    { fnName: "repeat", fnParams: ['str', 'count'], fnBody: `return str.repeat(Number(count))` },
    { fnName: "replace", fnParams: ['str', 'toReplace', 'replacement'], fnBody: `return str.replace( toReplace, replacement)` },
    { fnName: "replaceAll", fnParams: ['str', 'toReplace', 'replacement'], fnBody: `return str.replaceAll( toReplace, replacement)` },
    { fnName: "split", fnParams: ['str1', 'str2'], fnBody: `return str1.split(str2)` },

]