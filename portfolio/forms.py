
from django import forms
from .models import Project, Skill, Profile, Education, Experience

class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ['title', 'description', 'technologies', 'project_link']

        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter project title'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Describe your project'
            }),
            'technologies': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Python, Django, MySQL'
            }),
            'project_link': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://github.com/username/project'
            }),
        }


class SkillForm(forms.ModelForm):
    class Meta:
        model = Skill
        fields = ['skill_name', 'proficiency']

        widgets = {
            'skill_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter skill name'
            }),
            'proficiency': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': 0,
                'max': 100
            }),
        }


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = [
            'full_name',
            'bio',
            'profile_image',
            'phone',
            'location',
            'website',
            'linkedin',
            'github'
        ]

        widgets = {
            'full_name': forms.TextInput(attrs={
                'class': 'form-control'
            }),
            'bio': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form-control'
            }),
            'location': forms.TextInput(attrs={
                'class': 'form-control'
            }),
            'website': forms.URLInput(attrs={
                'class': 'form-control'
            }),
            'linkedin': forms.URLInput(attrs={
                'class': 'form-control'
            }),
            'github': forms.URLInput(attrs={
                'class': 'form-control'
            }),
        }


class EducationForm(forms.ModelForm):
    class Meta:
        model = Education
        fields = [
            'degree',
            'institution',
            'passing_year',
            'description'
        ]

        widgets = {
            'degree': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter degree'
            }),
            'institution': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter institution'
            }),
            'passing_year': forms.NumberInput(attrs={
                'class': 'form-control'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3
            }),
        }
        

class ExperienceForm(forms.ModelForm):
    class Meta:
        model = Experience
        fields = [
            'company',
            'job_title',
            'start_date',
            'end_date',
            'description'
        ]

        widgets = {
            'company': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Company name'
            }),
            'job_title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Job title'
            }),
            'start_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'end_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3
            }),
        }

