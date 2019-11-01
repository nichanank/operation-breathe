# <A New Title>

A project to unite Earth's citizens to create a more sustainable planet.

## Description
Individuals, groups, orgs will help in preserving environment by reducing air pollution. Govt will fund NGO to oversee the process and NGO will then reward the individuals who helped in the process.
* Govt will fund the Reserve Contract(owned by NGO) expecting them to achieve a milestone such as lowering the AQI value to let's say 100. The Reserve Contract will calculate the amount of tokens that will be minted as reward for the milestone.
* Individuals will help in the cause daily by doing activities that helps in reducing air pollution. They will upload their picture to ipfs and will call the NGO Contract with the hash. Their claim to help the cause will go to pending state and then NGO owners/organisers will verify the picture and reward a point to the individual.
* NGO would periodically call oracle to get AQI and check if the target is met or not. Besides this periodic call any individual would also be able to call the method of checking the AQI value give that they pay 1 LINK for that.
* When AQI value is below the target, automatically the NGO contract will call the Reserve Contract to distribute/mint tokens to individuals who helped achieving that goal. The amount each individual get will be proportional to their score.
* Individuals will be able to convert their tokens anytime to ETH(real money).
* Now after achieving the target the govt can fund the contract again for Round 2 with new target value and then more tokens will be minted for next set of contributors.
* The reason for using continuous token here is because early contributors will earn more profit as the project gets more funding. This creates an incentive to help early. Other than govt, any individual can donate ETH to the project but he will not be able to set the target value.

## Development

To use external adapters we'll have to run our chainlink node. https://docs.chain.link/docs/node-operators

Add jobs and then view their runs by running `request-data.js`

#### 1. Have a chainlink node running

1. Start a local chainlink node. Instructions here https://docs.fiews.io/docs/run-a-chainlink-node-from-scratch
2. Send ETH to your node on the network you plan on using, it will need some gas money to send a response

#### 2. Run your adaptor locally

1. Set your `AIRVISUAL_API_KEY` as an env variable
1. Have the external adaptor(s) running locally
2. On your node operator dashboard go to `Bridges` --> `Add Bridge` and fill in the details. For the bridge url use `[YOUR_IP_ADDRESS]:port` where your adaptor is running. Be sure to use your ip address and not `localhost`

#### 3. Add a job

1. Once the bridge is added, create a new job on the dashboard a paste the contents of `job-blob.json` into the json blob space.
2. Copy the job id and paste it into `scripts/request-data.js`

#### 4. Check your node with provided scripts

1. Set env variables `MNEMONIC` and `RPC_URL` like so: `export RPC_URL="https://ropsten.rpc.fiews.io/v1/free"` and `export MNEMONIC='[YOUR MNEMONIC]`
2. Deploy your contract using `npm run migrate:live` and fund your contract with LINK https://ropsten.chain.link (for ropsten)
2. Run helper scripts (see below)

## Testing

For deploying to live networks, Truffle will use `truffle-hdwallet-provider` for your mnemonic and an RPC URL. Set your environment variables `$RPC_URL` and `$MNEMONIC` before running:

```bash
npm run migrate:live
```

#### Helper Scripts

There are 3 helper scripts provided with this box in the scripts directory:

- `fund-contract.js`
- `request-data.js`
- `read-contract.js`

They can be used by calling them from `npx truffle exec`, for example:

```bash
npx truffle exec scripts/fund-contract.js --network live
```

The CLI will output something similar to the following:

```
Using network 'live'.

Funding contract: 0x972DB80842Fdaf6015d80954949dBE0A1700705E
0xd81fcf7bfaf8660149041c823e843f0b2409137a1809a0319d26db9ceaeef650
Truffle v5.0.25 (core: 5.0.25)
Node v10.15.1
```

In the `request-data.js` script, example parameters are provided for you. You can change the oracle address, Job ID, and parameters based on the information available on [our documentation](https://docs.chain.link/docs/testnet-oracles).

```bash
npx truffle exec scripts/request-data.js --network live
```

This creates a request and will return the transaction ID, for example:

```
Using network 'live'.

Creating request on contract: 0x972DB80842Fdaf6015d80954949dBE0A1700705E
0x828f256109f22087b0804a4d1a5c25e8ce9e5ac4bbc777b5715f5f9e5b181a4b
Truffle v5.0.25 (core: 5.0.25)
Node v10.15.1
```

After creating a request on a live network, you will want to wait 3 blocks for the Chainlink node to respond. Then call the `read-contract.js` script to read the contract's state.

```bash
npx truffle exec scripts/read-contract.js --network live
```

Once the oracle has responded, you will receive a value similar to the one below:

```
Using network 'live'.

21568
Truffle v5.0.25 (core: 5.0.25)
Node v10.15.1
```


## Challenges and Future Plans
* Couldn't find APIs for water pollution as it is not automated unlike air and requires manual testing so as of now this is specific for projects related to air pollution.
* Our model rewards people when a certain target is achieved, we want to make it more flexible and reward people instantly for any contribution they made but that requires figuring out how to calculate the impact of their effort. This is not easy to do now so that's why we are just rewarding 1 point for any task that helps to achieving target.
* Adding multiple mode of payments like DAI and other ERC20 tokens instead of just ETH.
* We will use chainlink in future to obtain animals, species of a location to prepare NFTs of animals, plants(which were saved) and distribute them to contributors.