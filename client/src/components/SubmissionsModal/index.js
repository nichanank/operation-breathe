import React, { useRef, useState } from 'react'
import { ethers } from 'ethers'
import styled from 'styled-components'
import { darken, transparentize } from 'polished'
import { isMobile } from 'react-device-detect'
import { BorderlessInput } from '../../theme'
import { calculateGasMargin } from '../../utils'
import { getMultihashFromContractResponse } from '../../utils/multihash'
import { useMyContract } from '../../hooks'
import Modal from '../Modal'
import { ReactComponent as Close } from '../../assets/img/x.svg'

const GAS_MARGIN = ethers.utils.bigNumberify(1000)
const IPFS_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs/'

const Button = styled.button`
  align-items: center;
  font-size: 1rem;
  color: ${({ selected, theme }) => (selected ? theme.textColor : theme.royalBlue)};
  height: 2rem;
  border: 1px solid ${({ selected, theme }) => (selected ? theme.mercuryGray : theme.royalBlue)};
  border-radius: 2.5rem;
  background-color: ${({ selected, theme }) => (selected ? theme.concreteGray : theme.zumthorBlue)};
  outline: none;
  cursor: pointer;
  user-select: none;
  :hover {
    border: 1px solid
      ${({ selected, theme }) => (selected ? darken(0.1, theme.mercuryGray) : darken(0.1, theme.royalBlue))};
  }
  :focus {
    border: 1px solid ${({ theme }) => darken(0.1, theme.royalBlue)};
  }
  :active {
    background-color: ${({ theme }) => theme.zumthorBlue};
  }
`

const StyledButtonName = styled.span`
  margin: 0 0.25rem 0 0.25rem;
`

const Submission = styled.div`
  flex-grow: 1;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`

const SubmissionsModalRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  cursor: pointer;
  user-select: none;
  #symbol {
    color: ${({ theme }) => theme.doveGrey};
  }
  :hover {
    background-color: ${({ theme }) => theme.tokenRowHover};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0.8rem 1rem;`}
`

const RowLeft = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  margin-left: 12px;
  align-items : center;
`

const SubmissionIDWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  margin-left: 1rem;
`

const SubmissionID = styled.div`
  color: ${({ theme }) => transparentize(0.4, theme.textColor)};
`

const Image = styled.img`
  width: ${({ size }) => '600px'};
  height: ${({ size }) => '350px'};
  background-color: white;
  border-radius: 1rem;
  align-self: center;
  z-index: 1;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
`

const RowRight = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: flex-end;
  justify-content: center;
  margin-right: 20px;
`

const SubmissionsModal = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  width: 100%;
`

const ModalHeader = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 0px 0px 1rem;
  height: 60px;
  color: ${({ theme }) => theme.textColor};
`

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.textColor};
  }
`

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const SearchContainer = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  justify-content: flex-start;
  padding: 0.5rem 1.5rem;
  background-color: ${({ theme }) => theme.concreteGray};
`

export default function SubmissionsListModal({
  isOpen,
  onDismiss,
  submissions,
  viewOnly,
  }) {

  const myContract = useMyContract()

  const [selectedSubmissionDetails, setSelectedSubmissionDetails] = useState({})
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('')
  
  const inputRef = useRef()

  function clearInputAndDismiss() {
    setSelectedSubmissionDetails({})
    setSelectedSubmissionId('')
    onDismiss()
  }

  function renderSubmissionDetails() {
    return (
       <React.Fragment key={selectedSubmissionDetails.id}>
        <RowLeft>
          <Image src={IPFS_GATEWAY_URL + selectedSubmissionDetails.hash}/>
        </RowLeft>
        {!viewOnly ? <RowRight>
          <Button onClick={async () => {
            const estimatedGas = await myContract.estimate.reviewSubmission(selectedSubmissionId, true)
            myContract.reviewSubmission(selectedSubmissionId, true, {
              gasLimit: calculateGasMargin(estimatedGas, GAS_MARGIN)
            })}}>
            <StyledButtonName>Accept</StyledButtonName>
          </Button>
          <Button onClick={async () => {
            const estimatedGas = await myContract.estimate.reviewSubmission(selectedSubmissionId, false)
            myContract.reviewSubmission(selectedSubmissionId, false, {
              gasLimit: calculateGasMargin(estimatedGas, GAS_MARGIN)
            })}}>
            <StyledButtonName>Reject</StyledButtonName>
          </Button>
        </RowRight> : null}
      </React.Fragment>
      )
    }

  function renderSubmissions() {
    return submissions.map((submission, key) => {
      return (
          submission.topics !== undefined ? 
          <React.Fragment key={key}>
            <SubmissionsModalRow
              onClick={async () => {
                myContract
                .getHash(Number(submission.topics[1]), {
                })
                .then((result) => {
                  if (selectedSubmissionId === Number(submission.topics[1])) { 
                    setSelectedSubmissionId('')
                    setSelectedSubmissionDetails({})
                  } else {
                    setSelectedSubmissionId(Number(submission.topics[1]))
                    setSelectedSubmissionDetails({hash: getMultihashFromContractResponse(result)})
                  }
                })
              }}>
              <RowLeft>
                <SubmissionIDWrapper>
                  <SubmissionID>{Number(submission.topics[1])}</SubmissionID>
                </SubmissionIDWrapper>
              </RowLeft>
            </SubmissionsModalRow>
          { selectedSubmissionId === Number(submission.topics[1]) ? renderSubmissionDetails(selectedSubmissionDetails) : null}
          </React.Fragment> :
          <React.Fragment key={key}>
          <SubmissionsModalRow
            onClick={async () => {
              myContract
              .getHash(submission)
              .then((result) => {
                if (selectedSubmissionId === submission) { 
                  setSelectedSubmissionId('')
                  setSelectedSubmissionDetails({})
                } else {
                  setSelectedSubmissionId(submission)
                  setSelectedSubmissionDetails({hash: getMultihashFromContractResponse(result)})
                }
              })
            }}>
            <RowLeft>
              <SubmissionIDWrapper>
                <SubmissionID>{submission}</SubmissionID>
              </SubmissionIDWrapper>
            </RowLeft>
          </SubmissionsModalRow>
        { selectedSubmissionId === submission ? renderSubmissionDetails(selectedSubmissionDetails) : null}
        </React.Fragment>
        )
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={clearInputAndDismiss}
      minHeight={60}
      initialFocusRef={isMobile ? undefined : inputRef}
    >
    <SubmissionsModal>
        <ModalHeader>
          <p>Pending Submissions</p>
          <CloseIcon onClick={clearInputAndDismiss}>
            <CloseColor alt={'close icon'} />
          </CloseIcon>
        </ModalHeader>
        <Submission>{renderSubmissions()}</Submission>
        </SubmissionsModal>
    </Modal>
  )
}