# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-06-28 21:49
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0004_auto_20170628_2138'),
    ]

    operations = [
        migrations.AddField(
            model_name='auction',
            name='charity',
            field=models.CharField(default='Against Malaria Foundation', max_length=80),
        ),
    ]
