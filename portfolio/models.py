from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    full_name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    profile_image = models.ImageField(
        upload_to='profile_images/',
        blank=True,
        null=True
    )
    phone = models.CharField(max_length=15, blank=True)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)

    def __str__(self):
        return self.full_name


class Project(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    title = models.CharField(max_length=150)
    description = models.TextField()
    technologies = models.CharField(max_length=255)
    project_link = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Skill(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='skills'
    )
    skill_name = models.CharField(max_length=100)
    proficiency = models.PositiveIntegerField(default=50)

    def __str__(self):
        return self.skill_name


class Education(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='education'
    )
    degree = models.CharField(max_length=150)
    institution = models.CharField(max_length=150)
    passing_year = models.PositiveIntegerField()
    description = models.TextField(blank=True)

    def __str__(self):
        return self.degree


class Experience(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='experience'
    )
    company = models.CharField(max_length=150)
    job_title = models.CharField(max_length=150)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.job_title