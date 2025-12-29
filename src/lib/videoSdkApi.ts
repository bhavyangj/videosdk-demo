// VideoSDK API utilities

export const createMeeting = async ({ token }: { token: string }): Promise<string> => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      authorization: `${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  
  const data = await res.json();
  return data.roomId;
};

export const validateMeeting = async ({ 
  roomId, 
  token 
}: { 
  roomId: string; 
  token: string 
}): Promise<boolean> => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms/validate/${roomId}`, {
    method: "GET",
    headers: {
      authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  return data.roomId === roomId;
};
