import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AnimatedCard from './AnimatedCard';

const meta: Meta<typeof AnimatedCard> = {
  title: 'Components/AnimatedCard',
  component: AnimatedCard,
  tags: ['autodocs'],
  argTypes: {
    triggerKey: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof AnimatedCard>;

export const Default: Story = {
  args: {
    triggerKey: 'initial',
    children: (
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Market Stats</h3>
        <p className="text-gray-600">This card animates its border when the key changes.</p>
        <div className="h-24 bg-blue-50 rounded flex items-center justify-center font-mono text-blue-600">
          DATA_PAYLOAD_REF_01
        </div>
      </div>
    ),
  },
};

export const CustomTrigger: Story = {
  args: {
    triggerKey: 'custom-1',
    children: (
      <div className="p-4 border-2 border-dashed border-purple-200 rounded text-center">
        Click controls to change triggerKey and see the animation
      </div>
    ),
  },
};
