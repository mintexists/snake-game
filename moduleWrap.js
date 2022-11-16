const importObject = {
    imports: { log: (arg) => console.log(arg) },
};

const obj = await WebAssembly.instantiateStreaming(fetch("out.wasm"), importObject)

const floatMemory = new Float32Array(obj.instance.exports.memory.buffer)

export let dumpMemory = () => console.log(new Float32Array(obj.instance.exports.memory.buffer))

export function main(xIn, yIn, count) {
    floatMemory.set(new Float32Array(xIn), 0)
    floatMemory.set(new Float32Array(yIn), xIn.length)

    let [xOutStart, xOutLength, yOutStart, yOutLength] = obj.instance.exports.main(0, xIn.length, xIn.length * 4, yIn.length, count)

    let xOut = [...new Float32Array(obj.instance.exports.memory.buffer).slice(xOutStart, xOutStart + xOutLength)]
    let yOut = [...new Float32Array(obj.instance.exports.memory.buffer).slice(yOutStart, yOutStart + yOutLength)]

    return [xOut, yOut]
}