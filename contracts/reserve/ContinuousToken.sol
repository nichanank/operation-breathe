pragma solidity >=0.4.21 <0.6.0;

import "./GoodReserve.sol";


contract ContinuousToken is GoodReserve {
    uint256 internal reserve;
    uint256 internal tokens;
  
    constructor(
        string _name,
        string _symbol,
        uint8 _decimals,
        uint _initialSupply,
        uint32 _reserveRatio
    ) public payable GoodReserve(_name, _symbol, _decimals, _initialSupply, _reserveRatio) {
        reserve = msg.value;
    }

    function () public payable { mint(); }

    // Will only be called by govt so a modifier needs to be put
    function mint() public payable {
        uint purchaseAmount = msg.value;
        tokens = _continuousMint(purchaseAmount);
        reserve = reserve.add(purchaseAmount);
    }

    function burn(uint _amount) public {
        uint refundAmount = _continuousBurn(_amount);
        reserve = reserve.sub(refundAmount);
        msg.sender.transfer(refundAmount);
    }

    function reserveBalance() public view returns (uint) {
        return reserve;
    }

    function distribute(address user, uint256 score, uint256 total) public returns (uint256) {
        uint256 amount = score * tokens;
        amount = amount / total;
        _mint(user, amount);
        return amount;
    }
}