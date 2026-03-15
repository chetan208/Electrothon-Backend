import Notification from "../model/Notification.js";

export async function notifyFriendPost({ posterId, posterName, posterAvatar, postId, postTitle, connections }) {
  if (!connections?.length) return;

  const notifications = connections.map(recipientId => ({
    recipient:  recipientId,
    type:       "friend_post",
    title:      `${posterName} ne ek naya post kiya`,
    message:    postTitle ? `"${postTitle.slice(0, 80)}"` : "Unka naya post dekho!",
    link:       `/post/${postId}`,
    meta: {
      postId,
      posterName,
      posterAvatar,
    },
  }));

  await Notification.insertMany(notifications);
  console.log(`[notifications] ${notifications.length} friend_post notifications created`);
}

export async function notifyOpportunity({ userId, title, message, link, opportunityData }) {
  await Notification.create({
    recipient: userId,
    type:      "opportunity",
    title,
    message,
    link,
    meta: { opportunity: opportunityData },
  });
}