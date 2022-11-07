import { AimOutlined } from '@ant-design/icons'
import { DatePicker, InputNumber } from 'antd'
import {
  Button,
  Dialog,
  FilePicker,
  Heading,
  Pane,
  SelectMenu,
  TextInputField,
  toaster,
} from 'evergreen-ui'
import { GeoPoint, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes } from 'firebase/storage'
import { useState } from 'react'
import { storage } from '../firebase'
import { createEvent, getEventByDocRef } from '../services/event'
import { DateValue } from '../types/dates'
import { EventData } from '../types/events'

export default function CreateEventButton() {
  const [eventTitle, setEventTitle] = useState('')
  const [foodbank, setFoodbank] = useState('')
  const [foodAmount, setFoodAmount] = useState(0)
  const [date, setDate] = useState<DateValue>()
  const [isCreateEventShown, setIsCreateEventShown] = useState(false)

  const [file, setFile] = useState<File>()

  // File upload
  const handleSelectFile = (files: FileList) => {
    if (files.length === 0) return

    const newFile = files[0]

    setFile(newFile)
  }

  const handleSubmit = async () => {
    if (!date) return
    const eventDate = date.seconds()

    const data: EventData = {
      title: eventTitle,
      date: new Timestamp(eventDate, 0),
      foodbankId: foodbank,
      foodAmount,
      location: new GeoPoint(0, 0),
      groupId: undefined,
    }

    // File upload
    const createdEvent = await getEventByDocRef(await createEvent(data))
    if (!file) {
      toaster.warning('Event picture missing')
      return
    }
    const userFileLocation = `images/events/${createdEvent?.id}`
    const imageRef = ref(storage, userFileLocation)
    uploadBytes(imageRef, file)
  }

  const handleSetFoodAmount = (amount: number | null) => {
    if (amount) setFoodAmount(amount)
  }

  return (
    <>
      <Button onClick={() => setIsCreateEventShown(true)}>Create Event</Button>
      <Dialog
        isShown={isCreateEventShown}
        title='Create an event'
        onCloseComplete={() => setIsCreateEventShown(false)}
        confirmLabel='Create'
        onConfirm={handleSubmit}
      >
        <Pane>
          <TextInputField
            required
            label='Event title'
            onChange={(e: any) => setEventTitle(e.target.value)}
            value={eventTitle}
            placeholder='Enter a title for the event'
          />

          <AimOutlined />

          <SelectMenu
            title='Select Foodbank'
            options={['Apple', 'Apricot', 'Banana', 'Cherry', 'Cucumber'].map(
              (label) => ({ label, value: label })
            )}
            selected={foodbank}
            onSelect={(item) => setFoodbank(item.value as string)}
          >
            <Button>{foodbank || 'Select name...'}</Button>
          </SelectMenu>

          <Heading size={400}>Amount of food (kg)</Heading>
          <InputNumber
            min={1}
            defaultValue={50}
            onChange={handleSetFoodAmount}
          />

          <Heading size={400}>Date</Heading>
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format='YYYY-MM-DD HH:mm'
            onChange={setDate}
            value={date}
          />

          <FilePicker
            multiple
            width='60%'
            onChange={handleSelectFile}
            placeholder='Place your profile picture here!'
          />
        </Pane>
      </Dialog>
    </>
  )
}