import React, { useState, useRef, useEffect } from 'react'
import { useWeb3Context } from 'web3-react'
import axios from 'axios'
import { ethers } from 'ethers'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import { useMyContract } from '../../hooks'
import { getBytes32FromMultihash } from '../../utils/multihash'
import { calculateGasMargin } from '../../utils'
import { actions } from '../../constants'
import { BorderlessInput } from '../../theme'
import Keys from '../../keys'
import Modal from '../Modal'
import { ReactComponent as Close } from '../../assets/img/x.svg'

const PHOTO_UPLOAD_ROUTE = 'http://localhost:4001/api/partnerPhotos/submit/'
const pinataUrl = `https://api.pinata.cloud/pinning/pinFileToIPFS/`
const GAS_MARGIN = ethers.utils.bigNumberify(1000)

const InputRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 0.25rem 0.85rem 0.75rem;
`

const Input = styled(BorderlessInput)`
  font-size: 1.5rem;
  margin-right: 10px;
  color: ${({ error, theme }) => error && theme.salmonRed};
  background-color: ${({ theme }) => theme.inputBackground};
  -moz-appearance: textfield;
`

const Select = styled.select`
  ${({ theme }) => theme.flexRowNoWrap}
  padding: 4px 50px 4px 15px;
  margin 0 20px 0 20px;
  line-height: 0;
  height: 2rem;
  align-items: center;
  border-radius: 2.5rem;
  outline: none;
  cursor: pointer;
  user-select: none;
  background: ${({ theme }) => theme.zumthorBlue};
  border: 1px solid ${({ theme }) => theme.royalBlue};
  color: ${({ theme }) => theme.royalBlue};
  option {
    color: black;
    background: white;
    display: flex;
    white-space: pre;
    min-height: 20px;
    padding: 0px 2px 1px;
  }
`

const PhotoModal = styled.div`
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

export default function PhotoUploadModal({
  onDismiss,
  isOpen,
  }) {
  
  const { account } = useWeb3Context()
  const myContract = useMyContract()

  const [file, setFile] = useState([])
  const [loading, setLoading] = useState(true)
  const [description, setDescription] = useState({})

  // manage focus on modal show
  const inputRef = useRef()

  function handleFile(e) {
    e.preventDefault()
    setFile(e.target.files[0])
  }

  function createOptions() {
    let options = []
    for (let i = 0; i < actions.length; i++) {
      options.push(
        <option key={i} value={i}>{actions[i]}</option>
      )
    }
    return options
  }

  async function uploadFile() {
    var data = new FormData()
    data.append('file', file)
    try {
      // pin file to IPFS
      const pinataRes = await axios.post(
        pinataUrl,
        data,
        {
          maxContentLength: 'Infinity',
          headers: {
              'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
              'pinata_api_key': Keys.apiKey,
              'pinata_secret_api_key': Keys.secret
            },
          keyvalues: {
            User: account,
            Description: description
          }
        }
      )
      // store file ipfsHash on blockchain
      const { digest, hashFunction, size } = getBytes32FromMultihash(pinataRes.data.IpfsHash)
      const estimatedGas = await myContract.estimate.claim(digest, hashFunction, size)
      myContract.claim(digest, hashFunction, size, {
        gasLimit: calculateGasMargin(estimatedGas, GAS_MARGIN)
      })
      .then(() => {
        clearInputAndDismiss()
        alert('photo upload successful!')
      })
    } catch (err) {
      console.log(err)
    }
  }

  async function onSubmitHandler(e) {
    e.preventDefault()
    const responses = []
    try {
      responses.push(await uploadFile(file))
    } catch (e) {
      console.error(e);
      return
    }
  }

  function clearInputAndDismiss() {
    onDismiss()
  }

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={clearInputAndDismiss}
      minHeight={60}
      initialFocusRef={isMobile ? undefined : inputRef} >
      <PhotoModal>
        <ModalHeader>
          <p>Upload a photo of your work</p>
          <CloseIcon onClick={clearInputAndDismiss}>
            <CloseColor alt={'close icon'} />
          </CloseIcon>
        </ModalHeader>
        <form onSubmit={async (e) => onSubmitHandler(e)} >
          <InputRow><Input type='file' name="photo" onChange={(e) => handleFile(e)} /></InputRow>
          <Select onChange={e => setDescription(e.target.value)}>
            <option value="" hidden>Select Action</option>
            {createOptions()}
          </Select>
          <input type='submit' />
        </form>
      </PhotoModal>
    </Modal>
  )
}