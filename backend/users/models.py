from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """
    Per-user profile for additional fields like credit balance and
    cumulative Gemini token usage. Linked 1:1 with Django's built-in User.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    # Balance of credits available to the user (app-defined unit)
    credits = models.PositiveIntegerField(default=100)

    # Optional cumulative usage counters for reporting/analytics
    gemini_input_tokens = models.PositiveBigIntegerField(default=0)
    gemini_output_tokens = models.PositiveBigIntegerField(default=0)

    # Auto-updated timestamp for quick insights on recent changes
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Profile<{self.user.username}> (credits={self.credits})" 