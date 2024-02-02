export const hasPermission = ({ rule, routine, feature, type }) => {
  const exceptions = rule?.routines;
  let success = true;
  let disabled = false;

  if (exceptions) {
    const exception = exceptions.find((x) => x.routine === routine);

    if (exception) {
      if (exception.disabled) {
        success = false;
      } else if (exception.features && feature) {
        const option = exception.features.find((x) => x.name === feature && x.type === type)?.option;

        if (option) {
          success = false;
          disabled = option === 'disabled';
        }
      }
    }
  }

  return { success, disabled };
};
