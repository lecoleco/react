import { useParams, useSearchParams } from 'next/navigation';

export const useUrlParam = (props) => {
  const param = props;
  let result = null;

  const searchP1 = useSearchParams();
  const searchP2 = useParams();

  if (searchP1) {
    result = searchP1.get(param) || undefined;
  }

  if (!result && searchP2) {
    result = searchP2[param] || undefined;
  }

  return result;
};
