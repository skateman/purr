require 'spec_helper'

describe Purr do
  it 'has a version number' do
    expect(Purr::VERSION).not_to be nil
  end

  describe '.server' do
    subject { described_class.server { |_| } }

    it 'returns with a rack application' do
      expect(subject).to respond_to(:call)
    end

    it 'always returns the same object' do
      expect(subject.object_id).to eq(described_class.server.object_id)
    end
  end
end
