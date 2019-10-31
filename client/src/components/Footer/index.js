import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'

import { ExternalLink } from '../../theme'

const FooterFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const FooterElement = styled.div`
  margin: 1.25rem;
  display: flex;
  min-width: 0;
  display: flex;
  align-items: center;
`

const Title = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.textColor};
  :hover {
    cursor: pointer;
  }
  #link {
    text-decoration-color: ${({ theme }) => theme.lastOfOursBlue};
  }
  #title {
    display: inline;
    font-size: 0.825rem;
    margin-right: 12px;
    font-weight: 400;
    color: ${({ theme }) => theme.textColor};
    :hover {
      color: ${({ theme }) => darken(0.2, theme.textColor)};
    }
  }
`
export default function Footer() {

  return (
    <FooterFrame>
      <FooterElement>
        <Title>
          <ExternalLink id="link" href="https://github.com/last-of-ours">
            <h1 id="title">Code</h1>
          </ExternalLink>
        </Title>
      </FooterElement>
    </FooterFrame>
  )
}