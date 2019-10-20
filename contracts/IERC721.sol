pragma solidity ^0.5.0;

import "../../erc/erc165/IERC165.sol";

/**
 * @title ERC721 Non-Fungible Token Standard basic interface
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract IERC721 is IERC165 {
    
    /**
      * @dev Emits when ownership of any NFT changes by any mechanism. This event emits when NFTs are
      * created (`from` == 0) and destroyed (`to` == 0). At the time of any transfer, the approved address 
      * for that NFT (if any) is reset to none.
      * @notice Exception: during contract creation, any number of NFTs may be created and assigned without emitting Transfer.
    */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
      * @dev Emits when the approved address for an NFT is changed or reaffirmed. The zero
      * address indicates there is no approved address. When a Transfer event emits, this also
      * indicates that the approved address for that NFT (if any) is reset to none.
    */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    
    /**
      * @dev Emits when an operator is enabled or disabled for an owner. The operator can manage
      * all NFTs of the owner.
    */
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    /**
      * @dev Returns the number of NFTs owned by `owner`. NFTs assigned to the zero address are
      * considered invalid, and this function throws for queries about the zero address.
      * @param owner Address for whom to query the balance.
      * @return Balance of `owner`.
    */
    function balanceOf(address owner) public view returns (uint256 balance);

    /**
      * @dev Returns the address of the owner of the NFT with `tokenId`.
      * NFTs assigned to zero address are considered invalid, and queries about them do throw.
      * @param tokenId The identifier for an NFT.
      * @return Address of `tokenId` owner.
    */
    function ownerOf(uint256 tokenId) public view returns (address owner);

    /**
      * @dev Set or reaffirm the approved address for an NFT.
      * @notice The zero address indicates there is no approved address. Throws unless `msg.sender` is
      * the current NFT owner, or an authorized operator of the current owner.
      * @param approved The new approved NFT controller.
      * @param tokenId The NFT to approve.
    */
    function approve(address approved, uint256 tokenId) public;

    /**
      * @dev Get the approved address for a single NFT.
      * @notice Throws if `_tokenId` is not a valid NFT.
      * @param tokenId The NFT to find the approved address for.
      * @return Address that _tokenId is approved for. 
    */
    function getApproved(uint256 tokenId) public view returns (address operator);

    /**
      * @dev Enables or disables approval for a third party ("operator") to manage all of
      * `msg.sender`'s assets. It also emits the ApprovalForAll event.
      * @notice The contract MUST allow multiple operators per owner.
      * @param operator Address to add to the set of authorized operators.
      * @param approved True if the operators is approved, false to revoke approval.
    */
    function setApprovalForAll(address operator, bool approved) public;

    /**
      * @dev Returns true if `_operator` is an approved operator for `_owner`, false otherwise.
      * @param owner The address that owns the NFTs.
      * @param operator The address that acts on behalf of the owner.
      * @return True if approved for all, false otherwise.
    */
    function isApprovedForAll(address owner, address operator) public view returns (bool);

    /**
      * @dev Throws unless `msg.sender` is the current owner, an authorized operator, or the approved
      * address for this NFT. Throws if `from` is not the current owner. Throws if `to` is the zero
       * address. Throws if `tokenId` is not a valid NFT.
      * @notice The caller is responsible to confirm that `to` is capable of receiving NFTs or else
      * they may be permanently lost.
      * @param from The current owner of the NFT.
      * @param to The new owner.
      * @param tokenId The NFT to transfer.
    */
    function transferFrom(address from, address to, uint256 tokenId) public;
    
    /**
      * @dev Transfers the ownership of an NFT from one address to another address.
      * @notice This works identically to the other function with an extra data parameter, except this
      * function just sets data to ""
      * @param from The current owner of the NFT.
      * @param to The new owner.
      * @param tokenId The NFT to transfer.
    */
    function safeTransferFrom(address from, address to, uint256 tokenId) public;

    /**
      * @dev Transfers the ownership of an NFT from one address to another address.
      * @notice Throws unless `msg.sender` is the current owner, an authorized operator, or the
      * approved address for this NFT. Throws if `from` is not the current owner. Throws if `to` is
      * the zero address. Throws if `tokenId` is not a valid NFT. When transfer is complete, this
      * function checks if `to` is a smart contract (code size > 0). If so, it calls
      * `onERC721Received` on `to` and throws if the return value is not 
      * `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`.
      * @param from The current owner of the NFT.
      * @param to The new owner.
      * @param tokenId The NFT to transfer.
      * @param data Additional data with no specified format, sent in call to `_to`.
    */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public;
}
