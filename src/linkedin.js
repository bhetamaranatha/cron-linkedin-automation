const axios = require('axios');
require('dotenv').config();

async function createLinkedInPost(text) {
    if (!text) return { posted: false, skipped: true };

    console.log('Posting to LinkedIn...');

    const memberId = process.env.LINKEDIN_MEMBER_ID;
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

    if (!accessToken || accessToken === 'YOUR_LINKEDIN_ACCESS_TOKEN') {
        process.stdout.write('\n[SKIP] LinkedIn Access Token is not set. Content generated:\n');
        process.stdout.write('-----------------------------------\n');
        process.stdout.write(text + '\n');
        process.stdout.write('-----------------------------------\n');
        return { posted: false, skipped: true, postId: null };
    }

    try {
        const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', {
            author: `urn:li:person:${memberId}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                        text: text
                    },
                    shareMediaCategory: "NONE"
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });

        const postId = response.data.id;
        console.log('Successfully posted to LinkedIn! ID:', postId);
        return { posted: true, skipped: false, postId };
    } catch (error) {
        console.error('Error posting to LinkedIn:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = { createLinkedInPost };
