export default class Scope {

    vars: Map<string, any>;
    parent: Scope | undefined;
    constructor(parent: Scope | undefined) {
        this.vars = new Map()
        this.parent = parent;
    }

    define(key: string, value: any) {
        this.vars.set(key, value)
    }

    lookup(key: string | undefined): any | undefined {

        if (!key) return undefined
        return this.vars.get(key) || this.parent?.lookup(key)
    }

    forEach(cb: (value: any, key: string) => void){

        this.vars.forEach(cb)
    }
}