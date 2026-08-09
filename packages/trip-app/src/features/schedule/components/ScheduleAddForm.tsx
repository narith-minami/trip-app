import type { FormEvent } from "react";
import { useState } from "react";
import type { EventType } from "@/lib/eventTypes";
import type { Facility } from "@/types/entities";
import { shiftEndTime } from "./calendarLayout";
import { Step1Form } from "./ScheduleAddForm.Step1";
import { Step2Form } from "./ScheduleAddForm.Step2";
import type { ScheduleFormValues } from "./ScheduleItemForm";

interface ScheduleAddFormProps {
  facilities: Facility[];
  defaultDate?: string;
  isSubmitting?: boolean;
  onSubmit: (values: ScheduleFormValues) => void;
  onCancel: () => void;
}

export function ScheduleAddForm({
  facilities,
  defaultDate,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ScheduleAddFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [eventType, setEventType] = useState<EventType | "">("");
  const [date, setDate] = useState(defaultDate ?? "");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [title, setTitle] = useState("");
  const [isTentative, setIsTentative] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const [placeUrl, setPlaceUrl] = useState("");
  const [memo, setMemo] = useState("");
  const [facilityId, setFacilityId] = useState("");

  const handleStartTimeChange = (value: string) => {
    const prevStart = startTime;
    setStartTime(value);
    if (endTime && prevStart && value) {
      setEndTime(shiftEndTime(prevStart, value, endTime));
    }
  };

  const handleStep2Submit = (e: FormEvent) => {
    e.preventDefault();
    const values: ScheduleFormValues = {
      date,
      startTime,
      endTime,
      title,
      eventType,
      isTentative,
      placeName,
      placeUrl,
      memo,
      facilityId,
    };
    onSubmit(values);
  };

  if (step === 1) {
    return (
      <Step1Form
        selectedType={eventType}
        onSelect={setEventType}
        onNext={() => setStep(2)}
        onCancel={onCancel}
      />
    );
  }

  return (
    <Step2Form
      facilities={facilities}
      date={date}
      startTime={startTime}
      endTime={endTime}
      title={title}
      isTentative={isTentative}
      placeName={placeName}
      placeUrl={placeUrl}
      memo={memo}
      facilityId={facilityId}
      isSubmitting={isSubmitting}
      onBackClick={() => setStep(1)}
      onDateChange={setDate}
      onStartTimeChange={handleStartTimeChange}
      onEndTimeChange={setEndTime}
      onTitleChange={setTitle}
      onTentativeChange={setIsTentative}
      onPlaceNameChange={setPlaceName}
      onPlaceUrlChange={setPlaceUrl}
      onMemoChange={setMemo}
      onFacilityChange={setFacilityId}
      onSubmit={handleStep2Submit}
      onCancel={onCancel}
    />
  );
}
