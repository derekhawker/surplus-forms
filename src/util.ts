export function assertNever(obj: never): never {
    throw throwError(`Unexpected obj: ${JSON.stringify(obj)}`);
}

export function throwError(msg: string, ...debugOutput: Array<any>): never {
    console.error(msg, debugOutput);
    throw new Error(msg);
}

