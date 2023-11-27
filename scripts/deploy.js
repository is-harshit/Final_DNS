const main = async () => {
  const domainContractFactory = await hre.ethers.getContractFactory('Domains');
  const domainContract = await domainContractFactory.deploy("innovate");
  await domainContract.waitForDeployment();

  console.log("Contract deployed to:", domainContract.target);

  let txn = await domainContract.register("CryptoX",  {value: hre.ethers.parseEther('0.1')});
  await txn.wait();
  console.log("Minted domain CryptoX.innovate");

  txn = await domainContract.setRecord("CryptoX", "Best Friends Forever!!");
  await txn.wait();
  console.log("Set record for CryptoX.innovate");

  const address = await domainContract.getAddress("CryptoX");
  console.log("Owner of domain CryptoX:", address);

  const balance = await hre.ethers.provider.getBalance(domainContract.target);
  console.log("Contract balance:", hre.ethers.formatEther(balance));
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
runMain();