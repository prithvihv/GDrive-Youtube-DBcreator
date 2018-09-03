let a = () => {
    return new Promise(async (resolve, rej) => {
        for (let i = 0; i < 10; i++) {
            console.log("inside a i: " + i)
            await counter()
        }
        console.log()
        resolve()
    })
};
let counter = () => {
    return new Promise((res, rej) => {
        setTimeout(() => {
            console.log("inside hello world ");
            res()
        }, 1000)
    })
}
console.log("program start");
a().then(()=>{
    console.log("program end");
})
