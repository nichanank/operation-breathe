pragma solidity >=0.4.21 <0.6.0;

import "./IERC721Receiver.sol";

contract ERC721Receiver is IERC721Receiver {
  function onERC721Received(address, uint256, bytes calldata) external returns (bytes4) {
    return bytes4(keccak256("onERC721Received(address,uint256,bytes)"));
  }
}