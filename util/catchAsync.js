module.exports = (fn) => {
    //if fn has error, then it returns promise with reject call,
    //so insted of then we need to use catch here for handling
    return (req, resp, next) => {
      fn(req, resp, next).catch(next);
    };
  };