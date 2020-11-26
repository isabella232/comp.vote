import { web3p } from "containers"; // Web3
import { createContainer } from "unstated-next"; // Unstated-next containerization

// Reference implementation: https://github.com/TennisBowling/comp.vote/blob/master/bySig/vote_by_signature.html
function useVote() {
  // Context
  const { web3, address } = web3p.useContainer();

  /**
   * Generate voting message
   * @param {Number} proposalId for Compound Governance proposal
   * @param {boolean} support for or against
   */
  const createVoteBySigMessage = (proposalId, support) => {
    // Types
    const types = {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Ballot: [
        { name: "proposalId", type: "uint256" },
        { name: "support", type: "bool" },
      ],
    };

    // Return message to sign
    return JSON.stringify({
      types,
      primaryType: "Ballot",
      // Compound Governor contract
      domain: {
        name: "Compound Governor Alpha",
        chainId: 1,
        verifyingContract: "0xc0da01a04c3f3e0be433606045bb7017a7323e38",
      },
      // Message
      message: {
        proposalId,
        // Enforce true || false
        support: !!support,
      },
    });
  };

  /**
   * Returns promise of web3 signature
   * @param {string} msgParams to sign
   */
  const signVote = async (msgParams) => {
    // Return promise
    return new Promise((resolve) => {
      // Sign message
      web3.currentProvider.sendAsync(
        {
          method: "eth_signTypedData_v4",
          params: [address, msgParams],
          from: address,
        },
        async (error, result) => {
          // If no error
          if (!error) {
            // Resolve promise with resulting signature
            resolve(result.result);
          }
        }
      );
    });
  };

  /**
   * Generate a FOR vote for the proposalId
   * @param {Number} proposalId of Compound governance proposal
   */
  const voteFor = async (proposalId) => {
    // Generate and sign message
    const msgParams = createVoteBySigMessage(proposalId, true);
    const signedMsg = await signVote(msgParams);

    // TODO: Setup post to server with signedMsg
    console.log(signedMsg);
  };

  /**
   * Generate an AGAINST vote for the proposalId
   * @param {Number} proposalId of compund governance proposal
   */
  const voteAgainst = async (proposalId) => {
    // Generate and sign message
    const msgParams = createVoteBySigMessage(proposalId, false);
    const signedMsg = await signVote(msgParams);

    // TODO: Setup post to server with signedMsg
    console.log(web3);
  };

  return {
    voteFor,
    voteAgainst,
  };
}

// Create unstated-next container
const vote = createContainer(useVote);
export default vote;