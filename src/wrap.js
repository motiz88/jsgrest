export default function wrap(promiseFn) {
    return function (req, res, next) { // 3
        promiseFn(req, res, next).catch(next) // 4
    }
}
