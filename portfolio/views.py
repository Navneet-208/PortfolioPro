from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Project
from django.shortcuts import render

def home(request):
    return render(request, 'home.html')

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .forms import ProjectForm
from portfolio.models import Project
from .models import Project, Skill
from .forms import ProjectForm, SkillForm
from .forms import ProjectForm, SkillForm, ProfileForm
from .models import Project, Skill, Profile
from .models import Project, Skill, Profile, Education, Experience
from .forms import ProjectForm, SkillForm, ProfileForm, EducationForm
from django.contrib.auth.models import User
from .forms import (
    ProjectForm,
    SkillForm,
    ProfileForm,
    EducationForm,
    ExperienceForm
)


def home(request):
    return render(request, 'home.html')


@login_required
def add_project(request):
    if request.method == 'POST':
        form = ProjectForm(request.POST)

        if form.is_valid():
            project = form.save(commit=False)
            project.user = request.user
            project.save()
            return redirect('dashboard')
    else:
        form = ProjectForm()

    return render(request, 'accounts/add_project.html', {
        'form': form
    })

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Project
from .forms import ProjectForm

@login_required
def edit_project(request, project_id):
    project = get_object_or_404(
        Project,
        id=project_id,
        user=request.user
    )

    if request.method == 'POST':
        form = ProjectForm(request.POST, instance=project)

        if form.is_valid():
            form.save()
            return redirect('dashboard')
    else:
        form = ProjectForm(instance=project)

    return render(request, 'accounts/edit_project.html', {
        'form': form,
        'project': project
    })

@login_required
def delete_project(request, project_id):
    project = get_object_or_404(
        Project,
        id=project_id,
        user=request.user
    )

    if request.method == 'POST':
        project.delete()
        return redirect('dashboard')

    return redirect('dashboard')


@login_required
def dashboard(request):
    projects = Project.objects.filter(user=request.user)

    context = {
        'profile': getattr(request.user, 'profile', None),
        'projects': request.user.projects.all(),
        'skills': request.user.skills.all(),
        'education': request.user.education.all(),
        'experience': request.user.experience.all(),
    }

    return render(request, 'accounts/dashboard.html', context)


@login_required
def add_skill(request):
    if request.method == 'POST':
        form = SkillForm(request.POST)

        if form.is_valid():
            skill = form.save(commit=False)
            skill.user = request.user
            skill.save()
            return redirect('dashboard')
    else:
        form = SkillForm()

    return render(request, 'accounts/add_skill.html', {
        'form': form
    })


@login_required
def edit_skill(request, skill_id):
    skill = get_object_or_404(
        Skill,
        id=skill_id,
        user=request.user
    )

    if request.method == 'POST':
        form = SkillForm(request.POST, instance=skill)

        if form.is_valid():
            form.save()
            return redirect('dashboard')
    else:
        form = SkillForm(instance=skill)

    return render(request, 'accounts/edit_skill.html', {
        'form': form,
        'skill': skill
    })

@login_required
def delete_skill(request, skill_id):
    skill = get_object_or_404(
        Skill,
        id=skill_id,
        user=request.user
    )

    if request.method == 'POST':
        skill.delete()

    return redirect('dashboard')


@login_required
def edit_profile(request):
    profile, created = Profile.objects.get_or_create(
        user=request.user,
        defaults={
            'full_name': request.user.get_full_name() or request.user.username
        }
    )

    if request.method == 'POST':
        form = ProfileForm(
            request.POST,
            request.FILES,
            instance=profile
        )

        if form.is_valid():
            form.save()
            return redirect('dashboard')
    else:
        form = ProfileForm(instance=profile)

    return render(request, 'accounts/edit_profile.html', {
        'form': form
    })

@login_required
def add_education(request):
    if request.method == 'POST':
        form = EducationForm(request.POST)

        if form.is_valid():
            education = form.save(commit=False)
            education.user = request.user
            education.save()
            return redirect('dashboard')
    else:
        form = EducationForm()

    return render(request, 'accounts/add_education.html', {
        'form': form
    })

@login_required
def edit_education(request, education_id):
    education = get_object_or_404(
        Education,
        id=education_id,
        user=request.user
    )

    if request.method == 'POST':
        form = EducationForm(
            request.POST,
            instance=education
        )

        if form.is_valid():
            form.save()
            return redirect('dashboard')
    else:
        form = EducationForm(instance=education)

    return render(request, 'accounts/edit_education.html', {
        'form': form
    })


@login_required
def delete_education(request, education_id):
    education = get_object_or_404(
        Education,
        id=education_id,
        user=request.user
    )

    if request.method == 'POST':
        education.delete()

    return redirect('dashboard')


@login_required
def add_experience(request):
    if request.method == 'POST':
        form = ExperienceForm(request.POST)

        if form.is_valid():
            experience = form.save(commit=False)
            experience.user = request.user
            experience.save()
            return redirect('dashboard')
    else:
        form = ExperienceForm()

    return render(request, 'accounts/add_experience.html', {
        'form': form
    })

@login_required
def edit_experience(request, experience_id):
    experience = get_object_or_404(
        Experience,
        id=experience_id,
        user=request.user
    )

    if request.method == 'POST':
        form = ExperienceForm(
            request.POST,
            instance=experience
        )

        if form.is_valid():
            form.save()
            return redirect('dashboard')
    else:
        form = ExperienceForm(instance=experience)

    return render(request, 'accounts/edit_experience.html', {
        'form': form
    })


@login_required
def delete_experience(request, experience_id):
    experience = get_object_or_404(
        Experience,
        id=experience_id,
        user=request.user
    )

    if request.method == 'POST':
        experience.delete()

    return redirect('dashboard')

def public_portfolio(request, username):
    user = get_object_or_404(
        User,
        username=username
    )

    profile = Profile.objects.filter(user=user).first()

    context = {
        'portfolio_user': user,
        'profile': profile,
        'projects': Project.objects.filter(user=user),
        'skills': Skill.objects.filter(user=user),
        'education': Education.objects.filter(user=user),
        'experience': Experience.objects.filter(user=user),
    }

    return render(
        request,
        'portfolio/public_portfolio.html',
        context
    )

def public_resume(request, username):
    user = get_object_or_404(
        User,
        username=username
    )

    profile = Profile.objects.filter(
        user=user
    ).first()

    context = {
        'portfolio_user': user,
        'profile': profile,
        'projects': Project.objects.filter(user=user),
        'skills': Skill.objects.filter(user=user),
        'education': Education.objects.filter(user=user),
        'experience': Experience.objects.filter(user=user),
    }

    return render(
        request,
        'portfolio/resume.html',
        context
    )
