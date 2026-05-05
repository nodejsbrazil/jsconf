import { VotingPage } from '@site/src/website/components/voting/VotingPage';

export default () => {
  // Tokens are in localStorage; VotingPage handles auth state
  return <VotingPage />;
};
