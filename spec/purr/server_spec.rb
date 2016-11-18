require 'spec_helper'

describe Purr::Server do
  subject { described_class.new(&block) }
  let(:block) { ->(_) { endpoint } }

  describe '#initialize' do
    shared_examples 'ArgumentError' do
      it 'raises ArgumentError' do
        expect { subject }.to raise_error(ArgumentError)
      end
    end

    context 'no block given' do
      let(:block) { nil }
      include_examples 'ArgumentError'
    end

    context 'block with too many aruments' do
      let(:block) { ->(_, _) {} }
      include_examples 'ArgumentError'
    end

    context 'block with single argument' do
      it 'sets the block as an instance variable' do
        expect(subject.instance_variable_get(:@remote)).to eq(block)
      end
    end
  end

  describe '#call' do
    let(:upgrade) { nil }
    let(:pipe) { IO.pipe }
    let(:hijack) { ->() { pipe.last } }
    let(:env) do
      {
        'rack.hijack'  => hijack,
        'HTTP_UPGRADE' => upgrade,
        'PURR_REQUEST' => 'MEOW',
        'PURR_VERSION' => Purr::VERSION
      }
    end

    shared_examples 'not_found' do
      it 'calls not_found' do
        expect(subject).to receive(:not_found)
        subject.call(env)
      end
    end

    context 'no endpoint is set' do
      let(:endpoint) { nil }
      include_examples 'not_found'
    end

    context 'endpoint unreachable' do
      let(:upgrade) { 'purr' }
      let(:endpoint) { ['localhost', 81] }
      include_examples 'not_found'

      it 'closes the hijacked socket' do
        subject.call(env)
        expect(pipe.last.closed?).to be_truthy
      end
    end

    context 'endpoint valid' do
      let(:endpoint) { ['example.com', 80] }
      let(:response) { pipe.first.read_nonblock(4096) }

      before { expect(hijack).to receive(:call).and_return(pipe.last) }

      shared_examples 'connect' do |proto|
        let(:upgrade) { proto }

        it "upgrades to #{proto}" do
          subject.call(env)
          expect(response).to match("Upgrade: #{proto}")
        end

        it 'sets up proxying' do
          expect(subject.instance_variable_get(:@proxy)).to receive(:push)
          subject.call(env)
        end
      end

      context 'purr request' do
        include_examples('connect', 'purr')
      end

      context 'websocket request' do
        include_examples('connect', 'websocket')
      end
    end
  end
end
