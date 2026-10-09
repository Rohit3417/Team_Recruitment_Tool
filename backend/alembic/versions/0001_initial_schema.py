"""Initial 4-table schema for recruitment tool.

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-10-09 09:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID

# revision identifiers, used by Alembic.
revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgcrypto extension for gen_random_uuid() if needed
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')

    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    # 1. datasets
    if 'datasets' not in existing_tables:
        op.create_table(
            'datasets',
            sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
            sa.Column('name', sa.String(255), nullable=False),
            sa.Column('uploaded_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.Column('content_hash', sa.String(64), nullable=False),
            sa.Column('teams_json', JSONB, nullable=False),
            sa.Column('validation_report_json', JSONB, nullable=False),
        )
        op.create_index('idx_datasets_content_hash', 'datasets', ['content_hash'])
        op.create_index('idx_datasets_uploaded_at', 'datasets', [sa.text('uploaded_at DESC')])

    # 2. configurations
    if 'configurations' not in existing_tables:
        op.create_table(
            'configurations',
            sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
            sa.Column('name', sa.String(255), nullable=False),
            sa.Column('is_preset', sa.Boolean(), nullable=False, server_default=sa.text('FALSE')),
            sa.Column('config_json', JSONB, nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        )
        op.create_index('idx_configurations_is_preset', 'configurations', ['is_preset'])
        op.create_index('idx_configurations_created_at', 'configurations', [sa.text('created_at DESC')])

    # 3. runs
    if 'runs' not in existing_tables:
        op.create_table(
            'runs',
            sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
            sa.Column('dataset_id', UUID(as_uuid=True), sa.ForeignKey('datasets.id', ondelete='CASCADE'), nullable=False),
            sa.Column('config_snapshot_json', JSONB, nullable=False),
            sa.Column('run_hash', sa.String(64), nullable=False),
            sa.Column('results_json', JSONB, nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        )
        op.create_index('idx_runs_dataset_id', 'runs', ['dataset_id'])
        op.create_index('idx_runs_run_hash', 'runs', ['run_hash'])
        op.create_index('idx_runs_created_at', 'runs', [sa.text('created_at DESC')])

    # 4. overrides
    if 'overrides' not in existing_tables:
        op.create_table(
            'overrides',
            sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
            sa.Column('run_id', UUID(as_uuid=True), sa.ForeignKey('runs.id', ondelete='CASCADE'), nullable=False),
            sa.Column('team_id', sa.String(64), nullable=False),
            sa.Column('action', sa.String(20), nullable=False),
            sa.Column('reason', sa.Text(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.CheckConstraint("action IN ('pin', 'exclude', 'waitlist')", name='ck_overrides_action'),
        )
        op.create_index('idx_overrides_run_id', 'overrides', ['run_id'])
        op.create_index('idx_overrides_run_team', 'overrides', ['run_id', 'team_id'])


def downgrade() -> None:
    op.drop_table('overrides')
    op.drop_table('runs')
    op.drop_table('configurations')
    op.drop_table('datasets')
