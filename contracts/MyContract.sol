pragma solidity 0.4.24;

import "chainlink/contracts/ChainlinkClient.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./reserve/ContinuousToken.sol";

/**
 * @title MyContract is an example contract which requests data from
 * the Chainlink network
 * @dev This contract is designed to work on multiple networks, including
 * local test networks
 */
contract MyContract is ChainlinkClient, Ownable {
  
  uint256 public data;
  uint256 totalSubmissions;
  uint256 totalScore;
  bool redeemPhase;

  address[] users;

  ContinuousToken tokenContract;

  mapping(address => uint256) public scores;

  enum Status {
    Pending,
    Accepted,
    Rejected
  }

  struct Multihash {
    bytes32 digest;
    uint8 hashFunction;
    uint8 size;
  }

  struct Submission {
    uint256 submissionId;
    address user;
    Multihash ipfsHash;
    Status status;
  }

  Submission[] submissions;

  event Data(uint256 data, bytes32 requestId);
  event ClaimSubmitted(uint256 indexed submissionId, address indexed user, Multihash indexed ipfsHash, Status status);
  event ClaimReviewed(uint256 indexed submissionId, address indexed user, Multihash indexed ipfsHash, Status status);
  event RedeemPhase(bool on);
   
  /**
   * @notice Deploy the contract with a specified address for the LINK
   * and Oracle contract addresses
   * @dev Sets the storage for the specified addresses
   * @param _link The address of the LINK token contract
   */
  // constructor(address _link, ContinuousToken _token) public {
    constructor(address _link, address _token) public { // delete this line and uncomment the above when continuous token is ready
    totalSubmissions = 0;
    totalScore = 0;
    redeemPhase = false;
    if (_link == address(0)) {
      setPublicChainlinkToken();
    } else {
      setChainlinkToken(_link);
    }
    tokenContract = ContinuousToken(_token);
  }

  /**
   * @notice Returns the address of the LINK token
   * @dev This is the public implementation for chainlinkTokenAddress, which is
   * an internal method of the ChainlinkClient contract
   */
  function getChainlinkToken() public view returns (address) {
    return chainlinkTokenAddress();
  }

  // Submit a claim that you helped with the cause and earn score.
  function claim(bytes32 _digest, uint8 _hashFunction, uint8 _size) public returns (uint256) {
    
    // create multihash
    Multihash memory _ipfsHash = Multihash({
      digest: _digest,
      hashFunction: _hashFunction,
      size: _size
    });
    
    // create new submission
    Submission memory submission = Submission({
      submissionId: totalSubmissions,
      user: msg.sender,
      ipfsHash: _ipfsHash,
      status: Status.Pending
    });

    // store new submission
    submissions.push(submission);

    totalSubmissions = totalSubmissions + 1;

    emit ClaimSubmitted(totalSubmissions - 1, msg.sender, _ipfsHash, Status.Pending);

    return totalSubmissions;
  }

  function redeem() public {
    require(redeemPhase == true, "You cannot redeem now");
    if (scores[msg.sender] != 0){
      // uint256 amount = scores[msg.sender] * tokenContract.totalSupply();
      uint amount = 1; // should delete this and uncomment the above once tokenContract is ready.
      amount = amount / totalScore;
      // call on tokenContract to transfer that much tokens like tokenContract.transfer(msg.sender, amount);
      scores[msg.sender] = 0;
    }
  }

  /**
   * @notice The fulfill method from requests created by this contract
   * @dev The recordChainlinkFulfillment protects this function from being called
   * by anyone other than the oracle address that the request was sent to
   * @param _requestId The ID that was generated for the request
   * @param _data The answer provided by the oracle
   */
  function fulfill(bytes32 _requestId, uint256 _data)
    public
    recordChainlinkFulfillment(_requestId)
  {
    data = _data;
    if (data > 20){
      _targetAchieved();
    }
    emit Data(data, _requestId);
  }

  function reviewSubmission(uint256 submissionId, bool _accepted) public onlyOwner {
    require(submissions[submissionId].status == Status.Pending, "Claim has already been taken care of");
    
    if (_accepted) {
      submissions[submissionId].status = Status.Accepted;
    }
    else {
      submissions[submissionId].status = Status.Rejected;
    }
    
    scores[submissions[submissionId].user] = scores[submissions[submissionId].user] + 1;
    totalScore = totalScore + 1;
    emit ClaimReviewed(submissionId, msg.sender, submissions[submissionId].ipfsHash, submissions[submissionId].status);
  }

  /**
   * @notice Creates a request to the specified Oracle contract address
   * @dev This function ignores the stored Oracle contract address and
   * will instead send the request to the address specified
   * @param _oracle The Oracle contract address to send the request to
   * @param _jobId The bytes32 JobID to be executed
   * @param _url The URL to fetch data from
   * @param _path The dot-delimited path to parse of the response
   * @param _times The number to multiply the result by
   */
  function createRequestTo(
    address _oracle,
    bytes32 _jobId,
    uint256 _payment,
    string _url,
    string _path,
    int256 _times
  )
    public
    onlyOwner
    returns (bytes32 requestId)
  {
    Chainlink.Request memory req = buildChainlinkRequest(_jobId, this, this.fulfill.selector);
    req.add("url", _url);
    req.add("copyPath", _path);
    req.addInt("times", _times);
    requestId = sendChainlinkRequestTo(_oracle, req, _payment);
  }

  /**
   * @notice Allows the owner to withdraw any LINK balance on the contract
   */
  function withdrawLink() public onlyOwner {
    LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
    require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
  }

  /**
   * @notice Call this method if no response is received within 5 minutes
   * @param _requestId The ID that was generated for the request to cancel
   * @param _payment The payment specified for the request to cancel
   * @param _callbackFunctionId The bytes4 callback function ID specified for
   * the request to cancel
   * @param _expiration The expiration generated for the request to cancel
   */
  function cancelRequest(
    bytes32 _requestId,
    uint256 _payment,
    bytes4 _callbackFunctionId,
    uint256 _expiration
  )
    public
    onlyOwner
  {
    cancelChainlinkRequest(_requestId, _payment, _callbackFunctionId, _expiration);
  }

  function getHash(uint submissionId) public view returns (bytes32 digest, uint8 hashFunction, uint8 size) {
    Multihash storage data = submissions[submissionId].ipfsHash;
    return (data.digest, data.hashFunction, data.size);
  }

  // View your score
  function getScore() public view returns (uint256) {
    return scores[msg.sender];
  }

  function _targetAchieved() internal {
    // transfer tokens to user
    redeemPhase = true;
    emit RedeemPhase(true);

    for (uint256 i = 0; i < totalSubmissions; i++){
      uint256 score = scores[submissions[i].user];
      address user = scores[submissions[i].user];

      if (score != 0){
        scores[submissions[i].user] = 0;
        tokenContract.distribute(user, score, totalScore);
      }
    }
  }
}