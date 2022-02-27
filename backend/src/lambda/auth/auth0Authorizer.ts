import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'
import * as JwksRsa from 'jwks-rsa'

const logger = createLogger('authorizer')

//jwksUrl to get signing key
const jwksUrl = process.env.AUTH_0_JWKSURL

let cachedCertificate: string

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
    if(!authHeader)
      throw new Error('No authentication header')
    if(!authHeader.toLowerCase().startsWith('bearer '))
      throw new Error('Invalid authentication header')
    const token = getToken(authHeader)
    const cert = await getCertificate()
    return verify(token, cert, {algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
    if (!authHeader) 
      throw new Error('No authentication header')
    if (!authHeader.toLowerCase().startsWith('bearer '))
      throw new Error('Invalid authentication header')
    const split = authHeader.split(' ')
    const token = split[1]
    return token
}

async function getCertificate(): Promise<string> {
    if (cachedCertificate) return cachedCertificate
    logger.info(`Getting certificate from ${jwksUrl}`)
    const response = await Axios.get(jwksUrl)
    const keys = response.data.keys

    if (!keys || !keys.length)
      throw new Error('No keys found')

    const signingKeys = keys.filter(
      key => key.use === 'sig' && key.kty === 'RSA' && key.alg === 'RS256' && (key.x5c && key.x5c.length)
    )

    if (!signingKeys.length)
      throw new Error('JWKS signingKeys not found')

    const signingKey = signingKeys[0]
    cachedCertificate = await getPublicKey(signingKey.kid)
    logger.info('Valid certificate found', cachedCertificate)
    return cachedCertificate
}

//extract the signing key with kid
async function getPublicKey(kid: string): Promise<string> {
      const client = JwksRsa({jwksUri: jwksUrl})
     return (await client.getSigningKey(kid)).getPublicKey()
}
