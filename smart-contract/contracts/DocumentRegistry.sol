// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DocumentRegistry
 * @dev Enregistre et vérifie l'intégrité des hashs de documents dans la blockchain.
 */
contract DocumentRegistry {

    struct DocumentRecord {
        bytes32 documentHash;
        address owner;
        uint256 timestamp;
        bool exists;
        bool revoked;
    }

    // Mapping pour stocker les documents par leur ID unique
    mapping(bytes32 => DocumentRecord) private documents;

    // Événements obligatoires
    event DocumentRegistered(
        bytes32 indexed documentId,
        bytes32 indexed documentHash,
        address indexed owner,
        uint256 timestamp
    );

    event DocumentRevoked(
        bytes32 indexed documentId,
        address indexed owner,
        uint256 timestamp
    );

    // Erreurs personnalisées (Gas-efficient)
    error DocumentAlreadyExists();
    error DocumentNotFound();
    error EmptyDocumentId();
    error EmptyDocumentHash();
    error NotDocumentOwner();
    error DocumentAlreadyRevoked();

    /**
     * @notice Ajoute un nouveau document dans la blockchain.
     */
    function registerDocument(bytes32 documentId, bytes32 documentHash) external {
        if (documentId == bytes32(0)) revert EmptyDocumentId();
        if (documentHash == bytes32(0)) revert EmptyDocumentHash();
        if (documents[documentId].exists) revert DocumentAlreadyExists();

        documents[documentId] = DocumentRecord({
            documentHash: documentHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            exists: true,
            revoked: false
        });

        emit DocumentRegistered(documentId, documentHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Retourne toutes les informations d'un document.
     */
    function getDocument(bytes32 documentId) 
        external 
        view 
        returns (
            bytes32 documentHash, 
            address owner, 
            uint256 timestamp, 
            bool exists, 
            bool revoked
        ) 
    {
        DocumentRecord memory doc = documents[documentId];
        if (!doc.exists) revert DocumentNotFound();
        return (doc.documentHash, doc.owner, doc.timestamp, doc.exists, doc.revoked);
    }

    /**
     * @notice Retourne uniquement le hash stocké d'un document.
     */
    function getDocumentHash(bytes32 documentId) external view returns (bytes32) {
        DocumentRecord memory doc = documents[documentId];
        if (!doc.exists) revert DocumentNotFound();
        return doc.documentHash;
    }

    /**
     * @notice Vérifie la validité et l'authenticité d'un document.
     */
    function verifyDocument(bytes32 documentId, bytes32 documentHash) 
        external 
        view 
        returns (bool exists, bool isValid) 
    {
        DocumentRecord memory doc = documents[documentId];
        if (!doc.exists) return (false, false);
        if (doc.revoked) return (true, false);
        return (true, doc.documentHash == documentHash);
    }

    /**
     * @notice Indique si un document existe dans le registre.
     */
    function documentExists(bytes32 documentId) external view returns (bool) {
        return documents[documentId].exists;
    }

    /**
     * @notice Révoque un document (accessible uniquement par son propriétaire).
     */
    function revokeDocument(bytes32 documentId) external {
        DocumentRecord storage doc = documents[documentId];
        if (!doc.exists) revert DocumentNotFound();
        if (doc.owner != msg.sender) revert NotDocumentOwner();
        if (doc.revoked) revert DocumentAlreadyRevoked();

        doc.revoked = true;
        emit DocumentRevoked(documentId, msg.sender, block.timestamp);
    }
}