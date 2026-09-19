from app.integrations.challenge_inbox import get_emails

emails = get_emails()

print(f"Total emails: {len(emails)}")
print()
print(emails[0])