import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.create();
  const DocumentRegistry = await ethers.getContractFactory("DocumentRegistry");
  const documentRegistry = await DocumentRegistry.deploy();

  await documentRegistry.waitForDeployment();

  console.log("DocumentRegistry deployed to:", await documentRegistry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
