# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-06-28 21:38
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0003_auto_20170628_0429'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Bids',
            new_name='Bid',
        ),
    ]
