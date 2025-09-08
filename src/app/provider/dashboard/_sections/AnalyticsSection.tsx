'use client'

export default function AnalyticsSection() {
  return (
    <div className="text-center py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="p-6 border rounded-lg">
          <p className="text-sm text-gray-500">Užsakymai šį mėnesį</p>
          <p className="text-3xl font-semibold">0</p>
        </div>
        <div className="p-6 border rounded-lg">
          <p className="text-sm text-gray-500">Pajamos šį mėnesį</p>
          <p className="text-3xl font-semibold">€0</p>
        </div>
        <div className="p-6 border rounded-lg">
          <p className="text-sm text-gray-500">Vid. įvertinimas</p>
          <p className="text-3xl font-semibold">N/A</p>
        </div>
      </div>
      <p className="text-gray-500 mt-8">Analitikos skydelis netrukus bus papildytas.</p>
    </div>
  )
}


