from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Admin interface to review and manage user credits and usage.
    """
    list_display = (
        'user',
        'credits',
        'gemini_input_tokens',
        'gemini_output_tokens',
        'updated_at',
    )
    search_fields = ('user__username', 'user__email') 