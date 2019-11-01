pragma solidity >=0.4.21 <0.6.0;

import "./GoodReserve.sol";


contract ContinuousToken is GoodReserve {
    uint256 internal reserve;
    uint256 internal tokens;
    address public govt;
    uint256 public target;
    bool public redeem = true; // Status of project, false = target set and not met yet

    constructor(
        string _name,
        string _symbol,
        uint8 _decimals,
        uint _initialSupply,
        uint32 _reserveRatio,
        address _govt
    ) public payable GoodReserve(_name, _symbol, _decimals, _initialSupply, _reserveRatio) {
        reserve = msg.value;
        govt = _govt;
    }

    function () public payable { mint(); }

    
    function getTarget() public view returns (uint256) {
        return target;
    }

    function getGovtAddr() public view returns (address){
        return govt;
    }

    function setTarget(uint256 _target) public payable {
        require(msg.sender == govt, "Only govt can set target");
        require(redeem == true, "Target value already set");
        uint purchaseAmount = msg.value;
        tokens = _continuousMint(purchaseAmount);
        reserve = reserve.add(purchaseAmount);
        redeem = false;
        target = _target;
    }

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
        redeem = true;
        return amount;
    }
}