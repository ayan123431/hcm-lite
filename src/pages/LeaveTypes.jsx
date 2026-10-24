import SimpleCrud from '../components/SimpleCrud'

export default function LeaveTypes() {
  return (
    <SimpleCrud
      title="Leave Types"
      col="leaveTypes"
      fields={[
        { name: 'name', label: 'Leave name (e.g. Casual)' },
        { name: 'quota', label: 'Yearly quota (days)', type: 'number' },
      ]}
    />
  )
}