const findKeyCaseInsensitive = (payload, expectedKey) => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  return Object.keys(payload).find((key) => key.toLowerCase() === expectedKey.toLowerCase());
};

export const readCollection = (payload, possibleKeys = []) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  for (const possibleKey of possibleKeys) {
    const matchingKey = findKeyCaseInsensitive(payload, possibleKey);

    if (matchingKey && Array.isArray(payload[matchingKey])) {
      return payload[matchingKey];
    }
  }

  return [];
};

export const readValue = (payload, possibleKeys = [], fallbackValue = null) => {
  if (!payload || typeof payload !== 'object') {
    return fallbackValue;
  }

  for (const possibleKey of possibleKeys) {
    const matchingKey = findKeyCaseInsensitive(payload, possibleKey);

    if (matchingKey) {
      return payload[matchingKey];
    }
  }

  return fallbackValue;
};
