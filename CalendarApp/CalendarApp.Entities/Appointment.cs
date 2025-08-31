using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.Entities
{
    public class Appointment
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Note { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DurationType DurationType { get; set; }
        public int DurationValue { get; set; }
        public Status Status { get; set; }

        public int ManagerId { get; set; }
        public virtual Manager Manager { get; set; }

        public ICollection<AppointmentCustomer> AppointmentCustomers { get; set; }
    }
    public enum DurationType
    {
        Hours,
        Days
    }
    public enum Status
    {
        Planned,
        Complate,
        Canceled,
        Win,
        Lose
    }
}
