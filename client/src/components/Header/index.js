import React from 'react'
import styled from 'styled-components'
import Web3Status from '../Web3Status'
import { ExternalLink } from '../../theme'
import { darken } from 'polished'

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const HeaderElement = styled.div`
  margin: 1.25rem;
  display: flex;
  min-width: 0;
  display: flex;
  align-items: center;
`

const Shake = styled.span`
  transform: rotate(0deg);
  transition: transform 300ms ease-out;
  :hover {
    transform: rotate(50deg);
  }
`

const Title = styled.div`
  display: flex;
  align-items: center;
  :hover {
    cursor: pointer;
  }
  #link {
    text-decoration-color: ${({ theme }) => theme.textColor};
  }
  #title {
    display: inline;
    font-size: 1rem;
    font-weight: 500;
    margin-right: 25px;
    color: ${({ theme }) => theme.textColor};
    :hover {
      color: ${({ theme }) => darken(0.2, theme.textColor)};
    }
  }
  #navigation {
    display: inline;
    font-size: 1rem;
    font-weight: 500;
    margin-right: 15px;
    color: ${({ theme }) => theme.textColor};
    :hover {
      color: ${({ theme }) => darken(0.2, theme.textColor)};
    }
  }
`

export default function Header() {
  return (
    <HeaderFrame>
      <HeaderElement>
        <Title>
          <Shake>
            <ExternalLink id="link" href="https://github.com/nichanank/chainlink-hackathon">
              <span role="img" aria-label="earth">
                ☁️{'  '}
              </span>
            </ExternalLink>
          </Shake>
          <ExternalLink id="link" href="https://github.com/nichanank/chainlink-hackathon">
            <h1 id="title">CleanAir Alliance</h1>
          </ExternalLink>
        </Title>
      </HeaderElement>
      <HeaderElement>
        <Web3Status />
      </HeaderElement>
    </HeaderFrame>
  )
}