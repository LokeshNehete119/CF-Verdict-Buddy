console.log("CF notifier service worker started");

let lastSubmissionId = null;
let lastVerdict = null;

// convert raw CF verdict -> clean text with emoji
function prettyVerdict(verdict) {
    switch (verdict) {
        case "OK":
            return "✅ Accepted";
        case "WRONG_ANSWER":
            return "❌ Wrong Answer";
        case "TIME_LIMIT_EXCEEDED":
            return "🕒 Time Limit Exceeded";
        case "COMPILATION_ERROR":
            return "⚙️ Compilation Error";
        case "RUNTIME_ERROR":
            return "💥 Runtime Error";
        case "MEMORY_LIMIT_EXCEEDED":
            return "🚫 Memory Limit Exceeded";
        case "IDLENESS_LIMIT_EXCEEDED":
            return "💤 Idleness Limit Exceeded";
        default:
            return verdict;   // leave any unusual verdicts exactly as CF writes them
    }
}

async function check() {
    const data = await chrome.storage.sync.get("handle");
    const handle = data.handle;

    if (!handle) return;

    try {
        const res = await fetch(
            `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1`
        );

        const json = await res.json();
        if (json.status !== "OK") return;

        const sub = json.result[0];
        const id = sub.id;
        const verdict = sub.verdict || "IN_QUEUE";

        // build "A. Theatre Square"
        const problemTitle = `${sub.problem.index}. ${sub.problem.name}`;

        // first time only → just initialize
        if (lastSubmissionId === null) {
            lastSubmissionId = id;
            lastVerdict = verdict;
            return;
        }

        // new submission appeared
        if (id !== lastSubmissionId) {
            lastSubmissionId = id;
            lastVerdict = verdict;

            if (verdict !== "IN_QUEUE" && verdict !== "TESTING") {
                notify(problemTitle, prettyVerdict(verdict));
            }
        }

        // same submission, verdict changed
        else if (verdict !== lastVerdict) {
            lastVerdict = verdict;

            if (verdict !== "IN_QUEUE" && verdict !== "TESTING") {
                notify(problemTitle, prettyVerdict(verdict));
            }
        }

    } catch (e) {
        console.log(e);
    }
}

// Notification format:
// Title  -> A. Theatre Square
// Body   -> ✅ Accepted
function notify(problemTitle, verdictText) {
    chrome.notifications.create({
        type: "basic",
        title: problemTitle,
        message: verdictText,
        iconUrl: "icon.png"
    });
}

// run every ~7 seconds
chrome.alarms.create({ periodInMinutes: 0.12 });
chrome.alarms.onAlarm.addListener(check);
