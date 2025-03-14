const fakeNetworkDelay = async (t) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
};

module.exports = {
  fakeNetworkDelay,
};
