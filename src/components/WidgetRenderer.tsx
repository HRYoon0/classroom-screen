import type { WidgetData } from '../types/widget';
import { WIDGET_META } from '../constants';
import WidgetWrapper from './WidgetWrapper';
import TimerWidget from './widgets/TimerWidget';
import ClockWidget from './widgets/ClockWidget';
import StopwatchWidget from './widgets/StopwatchWidget';
import TrafficLightWidget from './widgets/TrafficLightWidget';
import NoiseMeterWidget from './widgets/NoiseMeterWidget';
import RandomNameWidget from './widgets/RandomNameWidget';
import GroupMakerWidget from './widgets/GroupMakerWidget';
import PollWidget from './widgets/PollWidget';
import TextWidget from './widgets/TextWidget';
import DrawingWidget from './widgets/DrawingWidget';
import QRCodeWidget from './widgets/QRCodeWidget';
import DiceWidget from './widgets/DiceWidget';
import WorkSymbolsWidget from './widgets/WorkSymbolsWidget';

interface Props {
  widget: WidgetData;
  onUpdate: (id: string, data: Partial<WidgetData>) => void;
  onRemove: (id: string) => void;
  onBringToFront: (id: string) => void;
  onConfigChange: (id: string, config: Record<string, unknown>) => void;
}

function renderWidgetContent(
  widget: WidgetData,
  onConfigChange: (config: Record<string, unknown>) => void
) {
  switch (widget.type) {
    case 'timer':
      return <TimerWidget config={widget.config} onConfigChange={onConfigChange} />;
    case 'clock':
      return <ClockWidget />;
    case 'stopwatch':
      return <StopwatchWidget />;
    case 'traffic-light':
      return <TrafficLightWidget />;
    case 'noise-meter':
      return <NoiseMeterWidget />;
    case 'random-name':
      return <RandomNameWidget config={widget.config} onConfigChange={onConfigChange} />;
    case 'group-maker':
      return <GroupMakerWidget config={widget.config} onConfigChange={onConfigChange} />;
    case 'poll':
      return <PollWidget config={widget.config} onConfigChange={onConfigChange} />;
    case 'text':
      return <TextWidget config={widget.config} onConfigChange={onConfigChange} />;
    case 'drawing':
      return <DrawingWidget />;
    case 'qr-code':
      return <QRCodeWidget config={widget.config} onConfigChange={onConfigChange} />;
    case 'dice':
      return <DiceWidget />;
    case 'work-symbols':
      return <WorkSymbolsWidget />;
    default:
      return <div className="text-slate-400 text-sm">알 수 없는 위젯</div>;
  }
}

export default function WidgetRenderer({
  widget,
  onUpdate,
  onRemove,
  onBringToFront,
  onConfigChange,
}: Props) {
  const meta = WIDGET_META[widget.type];

  return (
    <WidgetWrapper
      widget={widget}
      onUpdate={onUpdate}
      onRemove={onRemove}
      onBringToFront={onBringToFront}
      title={`${meta.icon} ${meta.label}`}
    >
      {renderWidgetContent(widget, (config) => onConfigChange(widget.id, config))}
    </WidgetWrapper>
  );
}
