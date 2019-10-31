import React, { useState, useEffect } from 'react'
import { useWeb3Context } from 'web3-react'
import { ethers } from 'ethers'
import styled from 'styled-components'
import { calculateGasMargin, getUserSubmissions, getPendingSubmissions } from '../../utils'
import { useMyContract } from '../../hooks'
import { DubletContainer, DubletItem } from '../../theme'
import { useAdminStatus } from '../../contexts/Application'
import PhotoUploadModal from '../../components/PhotoUploadModal'
import SubmissionsModal from '../../components/SubmissionsModal'
// import { Link } from 'react-router-dom'
// import logo from '../../assets/img/tmp-logo.png'
// import game from '../../assets/img/game.png'
// import conservation from '../../assets/img/conservation.jpg'
// import ocean from '../../assets/img/ocean.jpg'

const GAS_MARGIN = ethers.utils.bigNumberify(1000)
const IPFS_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs/'

const TextContainer = styled.div`
  text-align: left;
  justify-content: left;
`

const Description = styled.div`
  font-weight: 400;
  font-size: 1rem;
  margin-bottom: 1rem;
`

const LeaderboardContainer = styled.div`
  margin-left: 10%;
  margin-right: 3%;
  padding: 1rem;
  justify-content: center;
  min-height: 30%;
  max-height: 400px;
  direction: inherit;
  overflow-y: auto;
  direction: ltr;
`

const LeaderboardRow = styled.div`
  overflow-y: scroll;
  direction: rtl;
`

const LeaderboardItem = styled.div`
  border: 1px solid darkslategrey;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const MainHeader = styled.h1`
  color: ${({ theme }) => theme.textColor};
  font-weight: 800;
  font-size: 3.5rem;
  text-align: center;
`

const SubHeader = styled.p`
  color: ${({ theme }) => theme.textColor};
  font-weight: 800;
  font-size: 1.2rem;
  text-align: left;
`

const OneLinerWrapper = styled.div`
  font-size: 0.9em;  
  margin-bottom: 2em;
  margin-top: 2em;
  margin-left: 1em;
  margin-right: 1em; 
`

const Button = styled.button`
  align-items: center;
  font-size: 1rem;
  margin-right: 1.5em;
  height: 2rem;
  color: ${({ theme }) => theme.textColor};
  border: 1px solid ${({ theme }) => theme.textColor};
  border-radius: 2.5rem;
  background-color: #81db96;
  outline: none;
  cursor: pointer;
  user-select: none;
  :hover {
    border: 1px solid
      ${({ selected, theme }) => (selected ? theme.mercuryGray : theme.royalBlue)};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.royalBlue};
  }
  :active {
    background-color: ${({ theme }) => theme.zumthorBlue};
  }
`

const StyledButtonName = styled.span`
  margin: 0 0.25rem 0 0.25rem;
`

export function Home() {

  const { library, account }= useWeb3Context()
  const myContract = useMyContract()
  
  const isAdmin = useAdminStatus()

  const [submissionsModalIsOpen, setSubmissionsModalIsOpen] = useState(false)
  const [photoUploadModalIsOpen, setPhotoUploadModalIsOpen] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [viewOnly, setViewOnly] = useState(true)
  const [loading, setLoading] = useState(true)

  function handleViewPendingSubmissions(e) {
    e.preventDefault()
    isAdmin ? setViewOnly(false) : setViewOnly(true)
    getPendingSubmissions(library).then((result) => {
      setSubmissions(result)
    }).then(() => {
      setSubmissionsModalIsOpen(true)
    })
  }

  function handleViewUserSubmissions(e) {
    e.preventDefault()
    isAdmin ? setViewOnly(false) : setViewOnly(true)
    getUserSubmissions(library, account).then((result) => {
      setSubmissions(result)
    }).then(() => {
      setSubmissionsModalIsOpen(true)
    })
  }

  function renderSubmissionsModal() {
    return (
      <SubmissionsModal
        isOpen={submissionsModalIsOpen}
        submissions={submissions}
        viewOnly={viewOnly}
        onDismiss={() => {
          setSubmissionsModalIsOpen(false)
        }}
      />  
    )
  }

  function renderPhotoUploadModal() {
    return (
      <PhotoUploadModal
        isOpen={photoUploadModalIsOpen}
        onDismiss={() => {
          setPhotoUploadModalIsOpen(false)
        }}
      />  
    )
  }

  function renderLeaderboard() {
    return (
      <React.Fragment>
        <LeaderboardRow>
          <p>this is an entry on the leaderboard</p>
        </LeaderboardRow>
        <LeaderboardRow>
          <p>this is an entry on the leaderboard</p>
        </LeaderboardRow>
        <LeaderboardRow>
          <p>this is an entry on the leaderboard</p>
        </LeaderboardRow>
      </React.Fragment>
    )
  }
      
  return (
    <>
    <MainHeader>breathe.</MainHeader>
    <DubletContainer>
      <DubletItem>
        <SubHeader>Current funding: 100 ETH</SubHeader>
        <SubHeader>How it works</SubHeader>
        <TextContainer>
          <Description>
            This project has been prefunded with 100 ETH. The purpose is to encourage community members of a city to take steps to reduce air pollution levels in their city.
          </Description>
          <Description>
          Anyone can submit a photo of themselves taking action to reduce air pollution. Eligible submissions can be as simple as carpooling, or taking public transportation to reduce the amount of cars on the road. The list of common steps you can take to reduce air pollution is available <a href='https://www3.epa.gov/region1/airquality/reducepollution.html'>here</a> or on the "Submit Work" pop up.
          </Description>
          <Description>
            1. Submit a photo of yourself taking steps to reduce air pollution. This photo will be stored on IPFS and its hash on the blockchain.<br/>
            2. An admin will review your submission and assign a score<br/>
            3. Each day, a smart contract calls on the AirQualityIndex API to retrieve the pollution levels in your city.<br/>
            4. If/when the air quality of your city reaches the goal, you will be rewarded with a number of tokens proportional to your score. You will also be minted an NFT badge for your participation.<br/>
          </Description>
        </TextContainer>
        <Button onClick={() => setPhotoUploadModalIsOpen(true)} >
          <StyledButtonName>Submit Work</StyledButtonName>
          {renderPhotoUploadModal()}
        </Button>
        <Button onClick={async () => {
          const estimatedGas = await myContract.estimate.function(1, 2)
          myContract
            .function(1, 2, {
              gasLimit: calculateGasMargin(estimatedGas, GAS_MARGIN)
            })
          }}>
          <StyledButtonName>Withdraw Reward</StyledButtonName>
        </Button>
        <Button onClick={(e) => handleViewPendingSubmissions(e)}>
          <StyledButtonName>View Pending Submissions</StyledButtonName>
          {renderSubmissionsModal()}
        </Button>
        <Button onClick={(e) => handleViewUserSubmissions(e)}>
          <StyledButtonName>View My Submissions</StyledButtonName>
          {renderSubmissionsModal()}
        </Button>
        </DubletItem>
        <DubletItem><SubHeader>Leaderboard</SubHeader>
          <LeaderboardContainer>
            {renderLeaderboard()}
          </LeaderboardContainer>
        </DubletItem>
        </DubletContainer>
  </>
  )
}