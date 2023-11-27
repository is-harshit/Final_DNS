const main = async () => {
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    const domainContract = await domainContractFactory.deploy("ninja");
    await domainContract.waitForDeployment();
    
    let met=await domainContract.getMetaData();
    await matchMedia.wait()

}    