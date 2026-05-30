const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DocumentRegistry", function () {
  let contract;
  let owner;
  let otherUser;

  beforeEach(async function () {
    [owner, otherUser] = await ethers.getSigners();
    const DocumentRegistry = await ethers.getContractFactory("DocumentRegistry");
    contract = await DocumentRegistry.deploy();
    await contract.waitForDeployment();
  });

  it("Devrait enregistrer un document avec succès et émettre l'événement", async function () {
    const documentId = ethers.id("DOC-001");
    const documentHash = ethers.id("hash-exemple-original");

    await expect(contract.registerDocument(documentId, documentHash))
      .to.emit(contract, "DocumentRegistered")
      .withArgs(documentId, documentHash, owner.address, any => any > 0);

    expect(await contract.documentExists(documentId)).to.equal(true);
  });

  it("Devrait refuser un document déjà existant", async function () {
    const documentId = ethers.id("DOC-001");
    const documentHash = ethers.id("hash-exemple-original");

    await contract.registerDocument(documentId, documentHash);
    await expect(contract.registerDocument(documentId, documentHash))
      .to.be.revertedWithCustomError(contract, "DocumentAlreadyExists");
  });

  it("Devrait récupérer toutes les informations d'un document", async function () {
    const documentId = ethers.id("DOC-001");
    const documentHash = ethers.id("hash-exemple");

    await contract.registerDocument(documentId, documentHash);
    const doc = await contract.getDocument(documentId);

    expect(doc.documentHash).to.equal(documentHash);
    expect(doc.owner).to.equal(owner.address);
    expect(doc.exists).to.equal(true);
    expect(doc.revoked).to.equal(false);
  });

  it("Devrait valider un document authentique", async function () {
    const documentId = ethers.id("DOC-001");
    const documentHash = ethers.id("hash-exemple");

    await contract.registerDocument(documentId, documentHash);
    const result = await contract.verifyDocument(documentId, documentHash);

    expect(result.exists).to.equal(true);
    expect(result.isValid).to.equal(true);
  });

  it("Devrait détecter un document modifié", async function () {
    const documentId = ethers.id("DOC-001");
    const documentHashOriginal = ethers.id("hash-original");
    const documentHashModifie = ethers.id("hash-modifie");

    await contract.registerDocument(documentId, documentHashOriginal);
    const result = await contract.verifyDocument(documentId, documentHashModifie);

    expect(result.exists).to.equal(true);
    expect(result.isValid).to.equal(false);
  });

  it("Devrait détecter un document inconnu", async function () {
    const documentIdInconnu = ethers.id("DOC-UNKNOWN");
    const documentHash = ethers.id("hash-exemple");

    const result = await contract.verifyDocument(documentIdInconnu, documentHash);
    expect(result.exists).to.equal(false);
    expect(result.isValid).to.equal(false);
  });

  it("Devrait permettre la révocation par le propriétaire", async function () {
    const documentId = ethers.id("DOC-001");
    const documentHash = ethers.id("hash-exemple");

    await contract.registerDocument(documentId, documentHash);
    
    await expect(contract.revokeDocument(documentId))
      .to.emit(contract, "DocumentRevoked");

    const result = await contract.verifyDocument(documentId, documentHash);
    expect(result.isValid).to.equal(false); // Doit être invalide même si le hash correspond
  });

  it("Devrait refuser la révocation par un utilisateur non-propriétaire", async function () {
    const documentId = ethers.id("DOC-001");
    const documentHash = ethers.id("hash-exemple");

    await contract.registerDocument(documentId, documentHash);
    
    await expect(contract.connect(otherUser).revokeDocument(documentId))
      .to.be.revertedWithCustomError(contract, "NotDocumentOwner");
  });
});